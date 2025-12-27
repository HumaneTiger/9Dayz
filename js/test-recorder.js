import Props from './props.js';

let isRecording = false;
let recordedCommands = [];
let recordingStartTick = 0;
let recordingStartTime = 0; // Fallback for when game is paused
let accumulatedPausedTicks = 0; // Fake ticks accumulated while paused
let gameUnpausedTick = null; // Game tick when game first unpauses
let logger = null; // UI logger function

export default {
  /**
   * @param {Function} logFunction - Optional logging function for UI feedback
   */
  startRecording: function (logFunction = null) {
    logger = logFunction;
    isRecording = true;
    recordedCommands = [];
    recordingStartTick = Props.getGameProp('timeIsUnity')?.gameTick || 0;
    recordingStartTime = Date.now();
    accumulatedPausedTicks = 0;
    gameUnpausedTick = null;
    console.log('🔴 Recording started at tick', recordingStartTick);
    console.log('🔴 Game paused:', Props.getGameProp('gamePaused'));
  },

  /**
   * Stop recording and save to localStorage
   */
  stopRecording: function () {
    isRecording = false;
    localStorage.setItem('recordedCommands', JSON.stringify(recordedCommands));
    console.log('⏹️ Recording stopped. Commands saved to localStorage:', recordedCommands.length);
    console.log('Commands:', recordedCommands);
  },

  /**
   * Check if currently recording
   */
  isRecording: function () {
    return isRecording;
  },

  /**
   * Wrap an event handler to record commands
   * @param {string} moduleName - Name of the module (e.g., 'Start')
   * @param {string} handlerName - Name of the handler (e.g., 'handleClick')
   * @param {Function} originalHandler - The original handler function
   * @returns {Function} Wrapped handler
   */
  wrapEventHandler: function (moduleName, handlerName, originalHandler) {
    return function (event) {
      // Record before executing
      if (isRecording) {
        const command = this.translateToCommand(moduleName, handlerName, event);
        if (command) {
          const currentTick = Props.getGameProp('timeIsUnity')?.gameTick || 0;
          const isPaused = Props.getGameProp('gamePaused');

          let relativeTick;
          if (isPaused) {
            // Game is paused, use elapsed milliseconds converted to "ticks"
            const elapsedMs = Date.now() - recordingStartTime;
            relativeTick = Math.floor(elapsedMs / 100);
            accumulatedPausedTicks = relativeTick; // Remember for transition
          } else {
            // Game is running
            if (gameUnpausedTick === null) {
              // First time game is running - remember the tick when it unpaused
              gameUnpausedTick = currentTick;
            }
            // Add accumulated paused ticks to game ticks
            relativeTick = accumulatedPausedTicks + (currentTick - gameUnpausedTick);
          }

          recordedCommands.push({
            ...command,
            tick: relativeTick,
          });

          // Log to UI if logger provided
          if (logger) {
            logger(`Recorded: ${command.type} at tick ${relativeTick}`);
          }
          console.log(
            '📝 Recorded:',
            command.type,
            'at tick',
            relativeTick,
            'gameTick:',
            currentTick,
            'paused:',
            isPaused
          );
        }
      }

      // Execute original handler
      return originalHandler.call(this, event);
    }.bind(this);
  },

  /**
   * Translate raw event to semantic command
   * @param {string} moduleName - Name of the module
   * @param {string} handlerName - Name of the handler
   * @param {Event} event - The DOM event
   * @returns {Object|null} Semantic command or null if not translatable
   */
  translateToCommand: function (moduleName, handlerName, event) {
    if (moduleName === 'Start' && handlerName === 'handleClick') {
      return this.translateStartClick(event);
    }

    // Add more handlers here as we expand
    return null;
  },

  /**
   * Translate Start.handleClick events to commands
   */
  translateStartClick: function (event) {
    const target = event.target;

    // Handle action buttons
    const actionButton = target.closest('.button');
    if (actionButton) {
      // Character selection
      const character = actionButton.getAttribute('data-character');
      if (character) {
        return {
          module: 'Start',
          type: 'start-select-character',
          selector: `.button[data-character="${character}"]`,
        };
      }

      // Named action buttons
      const actionClasses = [
        'start-real',
        'start-game',
        'back-screen-2',
        'continue-real',
        'start-tutorial',
        'restart',
        'resume',
        'card-tutorial-confirm',
      ];

      for (const className of actionClasses) {
        if (actionButton.classList.contains(className)) {
          return {
            module: 'Start',
            type: 'start-button',
            action: className,
            selector: `.button.${className}`,
          };
        }
      }
    }

    // Handle sliders
    const slider = target.closest('.slider');
    if (slider && slider.id) {
      return {
        module: 'Start',
        type: 'start-toggle-slider',
        selector: `#${slider.id}`,
      };
    }

    // Handle external links
    const href = target.getAttribute('data-href');
    if (href && href !== '#') {
      return {
        module: 'Start',
        type: 'start-external-link',
        href: href,
      };
    }

    // First screen click (any click on screen 1)
    if (Props.getGameProp('startMode') === 1) {
      return {
        module: 'Start',
        type: 'start-screen-advance',
        selector: '#startscreen .screen__1',
      };
    }

    return null;
  },

  /**
   * Get current recorded commands
   */
  getRecordedCommands: function () {
    return recordedCommands;
  },
};
