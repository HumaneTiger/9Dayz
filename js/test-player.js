import Props from './props.js';

let isPlaying = false;
let commandQueue = [];
let currentCommandIndex = 0;
let testTick = 0; // Independent test tick counter
let testTickInterval = null; // Interval for test ticks
let playbackTickOffset = 0; // Additional delay for slower playback
let jsErrors = [];
let logger = null; // UI logger function

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
          atTick: testTick,
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
  },

  /**
   * Load and start playback from localStorage
   * @param {number} tickOffset - Optional delay to add to each command tick (for slower playback)
   * @param {Function} logFunction - Optional logging function for UI feedback
   */
  startPlayback: function (tickOffset = 0, logFunction = null) {
    logger = logFunction;
    const recordedCommands = localStorage.getItem('recordedCommands');

    if (!recordedCommands) {
      this.log('No recorded commands found in localStorage', 'error');
      return;
    }

    try {
      commandQueue = JSON.parse(recordedCommands);
      playbackTickOffset = tickOffset;
      currentCommandIndex = 0;
      jsErrors = [];

      this.log(`Starting playback with ${commandQueue.length} commands`);
      this.log(`Tick offset: ${tickOffset}`);

      // Start playback
      isPlaying = true;
      testTick = 0;

      // Start test tick counter (100ms = 1 tick)
      testTickInterval = setInterval(() => {
        if (isPlaying) {
          testTick++;
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

    // Stop test tick counter
    if (testTickInterval) {
      clearInterval(testTickInterval);
      testTickInterval = null;
    }

    this.log('Playback stopped', 'info');

    if (jsErrors.length > 0) {
      this.log(`Errors encountered: ${jsErrors.length}`, 'error');
      console.error('Errors:', jsErrors);
    }

    if (currentCommandIndex >= commandQueue.length) {
      this.log('All commands executed successfully!', 'success');
    } else {
      this.log(`Stopped at command ${currentCommandIndex}/${commandQueue.length}`, 'warning');
    }

    document
      .getElementById('card-console')
      .querySelector('.start-playback')
      .classList.add('is--hidden');
    document
      .getElementById('card-console')
      .querySelector('.stop-playback')
      .classList.add('is--hidden');
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
    // Execute all commands that should fire at this tick
    while (
      currentCommandIndex < commandQueue.length &&
      commandQueue[currentCommandIndex].tick + playbackTickOffset <= testTick
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

      case 'Ui':
        if (command.selector) {
          this.clickElement(command.selector);
        }
        break;

      case 'Cards':
        if (command.selector) {
          this.clickElement(command.selector);
        }
        break;

      case 'Items':
        if (command.selector) {
          this.clickElement(command.selector);
        }
        break;

      case 'Crafting':
        if (command.selector) {
          this.clickElement(command.selector);
        }
        break;

      case 'Character':
        if (command.selector) {
          this.clickElement(command.selector);
        }
        break;

      case 'Player':
        if (command.type === 'move-player' && command.key) {
          this.pressKey(command.key);
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

  /**
   * Simulate a keydown event
   * @param {string} key - The key to press (e.g., 'w', 'ArrowUp')
   */
  pressKey: function (key) {
    // Create and dispatch synthetic keydown event
    console.log(`Simulating key press: ${key}`);
    const keyEvent = new KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true,
    });

    document.body.dispatchEvent(keyEvent);
  },
};
