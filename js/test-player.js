import Props from './props.js';
import Checkpoint from './checkpoint.js';
import Events, { EVENTS } from './events.js';

let isPlaying = false;
let commandQueue = [];
let currentCommandIndex = 0;
let playbackStartTick = 0;
let playbackStartTime = 0; // Real-world time when playback started
let accumulatedPausedTicks = 0; // Fake ticks accumulated during start sequence
let gameUnpausedTick = null; // Game tick when game actually starts
let playbackTickOffset = 0; // Additional delay for slower playback
let jsErrors = [];
let logger = null; // UI logger function
let pollingInterval = null; // For checking commands during start sequence

export default {
  /**
   * Initialize test player (set up error tracking)
   */
  init: function () {
    // Track JS errors during playback
    window.addEventListener('error', e => {
      if (isPlaying) {
        const failedCommand = commandQueue[currentCommandIndex];
        jsErrors.push({
          message: e.message,
          stack: e.error?.stack,
          atCommand: currentCommandIndex,
          atTick: Props.getGameProp('timeIsUnity')?.gameTick || 0,
          command: failedCommand,
          selector: failedCommand?.selector,
        });
        this.log(`JS Error: ${e.message}`, 'error');
        this.log(`At command: ${failedCommand?.type}`, 'error');
        this.log(`Selector: ${failedCommand?.selector}`, 'error');
        console.error('Full error:', e);
        this.stopPlayback();
      }
    });

    // Listen to game tick changes to execute commands
    Events.on(EVENTS.GAME_PROP_CHANGED, ({ prop }) => {
      if (prop === 'timeIsUnity' && isPlaying) {
        this.checkAndExecuteCommands();
      }
    });
  },

  /**
   * Load and start playback from localStorage
   * @param {number} tickOffset - Optional delay to add to each command tick (for slower playback)
   * @param {Function} logFunction - Optional logging function for UI feedback
   */
  startPlayback: function (tickOffset = 0, logFunction = null) {
    logger = logFunction;
    const savedCheckpoint = localStorage.getItem('saveCheckpoint');
    const savedCommands = localStorage.getItem('recordedCommands');

    if (!savedCommands) {
      this.log('No recorded commands found in localStorage', 'error');
      return;
    }

    if (!savedCheckpoint) {
      this.log('No checkpoint found in localStorage', 'error');
      return;
    }

    try {
      const checkpoint = JSON.parse(savedCheckpoint);
      commandQueue = JSON.parse(savedCommands);
      playbackTickOffset = tickOffset;
      currentCommandIndex = 0;
      jsErrors = [];

      this.log(`Starting playback with ${commandQueue.length} commands`);
      this.log(`Tick offset: ${tickOffset}`);

      // Restore checkpoint
      Checkpoint.restore(checkpoint);

      // Start playback
      isPlaying = true;
      playbackStartTick = Props.getGameProp('timeIsUnity')?.gameTick || 0;
      playbackStartTime = Date.now();
      accumulatedPausedTicks = 0;
      gameUnpausedTick = null;

      // Start polling for commands (needed during start sequence when game ticks don't advance)
      pollingInterval = setInterval(() => {
        if (isPlaying) {
          this.checkAndExecuteCommands();
        }
      }, 100);

      // Unpause game to start ticks
      Props.pauseGame(false);
    } catch (e) {
      this.log(`Failed to start playback: ${e.message}`, 'error');
    }
  },

  /**
   * Stop playback
   */
  stopPlayback: function () {
    if (!isPlaying) return;

    isPlaying = false;
    Props.pauseGame(true);

    // Stop polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }

    this.log('Playback stopped', 'warning');

    if (jsErrors.length > 0) {
      this.log(`Errors encountered: ${jsErrors.length}`, 'error');
      console.error('Errors:', jsErrors);
    }

    if (currentCommandIndex >= commandQueue.length) {
      this.log('All commands executed successfully!', 'success');
    } else {
      this.log(`Stopped at command ${currentCommandIndex}/${commandQueue.length}`, 'warning');
    }
  },

  /**
   * Log message (to UI if logger provided, otherwise console)
   */
  log: function (message, type = 'info') {
    if (logger) {
      logger(message, type);
    } else {
      const icon =
        type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '▶️';
      console.log(`${icon} ${message}`);
    }
  },

  /**
   * Check if any commands should execute at current tick
   */
  checkAndExecuteCommands: function () {
    const currentTick = Props.getGameProp('timeIsUnity')?.gameTick || 0;
    let relativeTick;

    // During start sequence (ticks haven't advanced yet), use elapsed time
    if (currentTick === playbackStartTick) {
      const elapsedMs = Date.now() - playbackStartTime;
      const fakeTicks = Math.floor(elapsedMs / 100);
      relativeTick = fakeTicks;
      accumulatedPausedTicks = fakeTicks;
    } else {
      // Game has started - switch to game ticks
      if (gameUnpausedTick === null) {
        gameUnpausedTick = currentTick;
      }
      relativeTick = accumulatedPausedTicks + (currentTick - gameUnpausedTick);
    }

    // Execute all commands that should fire at this tick
    while (
      currentCommandIndex < commandQueue.length &&
      commandQueue[currentCommandIndex].tick + playbackTickOffset <= relativeTick
    ) {
      const command = commandQueue[currentCommandIndex];
      this.log(
        `Executing command ${currentCommandIndex + 1}/${commandQueue.length}: ${command.type}`
      );

      try {
        this.executeCommand(command);
        currentCommandIndex++;
      } catch (e) {
        this.log(`Command execution failed: ${e.message}`, 'error');
        this.log(`Command: ${command.type}`, 'error');
        this.log(`Selector: ${command.selector}`, 'error');
        console.error('Full error:', e);
        jsErrors.push({
          message: e.message,
          stack: e.stack,
          atCommand: currentCommandIndex,
          command: command,
          selector: command.selector,
        });
        this.stopPlayback();
        return;
      }
    }

    // Check if we're done
    if (currentCommandIndex >= commandQueue.length) {
      this.stopPlayback();
    }
  },

  /**
   * Execute a single command by simulating a click
   */
  executeCommand: function (command) {
    // Handle commands by module
    switch (command.module) {
      case 'Start':
        // Skip external links
        if (command.type === 'start-external-link') {
          this.log(`Skipping external link: ${command.href}`, 'warning');
        } else if (command.selector) {
          this.clickElement(command.selector);
        }
        break;

      default:
        this.log(`Unknown command module: ${command.module} ${command.type}`, 'warning');
    }
  },

  /**
   * Simulate a left-click on a DOM element
   * @param {string} selector - CSS selector for the target element
   */
  clickElement: function (selector) {
    const target = document.querySelector(selector);
    if (!target) {
      throw new Error(`DOM target not found: ${selector}`);
    }

    // Create and dispatch synthetic left-click event
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0, // left click
    });

    target.dispatchEvent(mouseEvent);
  },
};
