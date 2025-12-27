import Props from './props.js';
import Checkpoint from './checkpoint.js';

let isRecording = false;
let recordedCommands = [];
let testTick = 0; // Independent test tick counter
let testTickInterval = null; // Interval for test ticks
let logger = null; // UI logger function

export default {
  /**
   * @param {Function} logFunction - Optional logging function for UI feedback
   */
  startRecording: function (logFunction = null) {
    logger = logFunction;
    isRecording = true;
    recordedCommands = [];
    testTick = 0;

    // Save checkpoint at start
    Checkpoint.save('test', 'testCheckpoint');

    // Start test tick counter (100ms = 1 tick)
    testTickInterval = setInterval(() => {
      if (isRecording) {
        testTick++;
      }
    }, 100);

    console.log('🔴 Recording started');
  },

  /**
   * Stop recording and save to localStorage
   */
  stopRecording: function () {
    isRecording = false;

    // Stop test tick counter
    if (testTickInterval) {
      clearInterval(testTickInterval);
      testTickInterval = null;
    }

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
          recordedCommands.push({
            ...command,
            tick: testTick,
          });

          // Log to UI if logger provided
          if (logger) {
            logger(`Recorded: ${command.type} at tick ${testTick}`);
          }
          console.log('📝 Recorded:', command.type, 'at tick', testTick);
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
    if (moduleName === 'Cards' && handlerName === 'checkForCardClick') {
      return this.translateCardsClick(event);
    }
    if (moduleName === 'Player' && handlerName === 'handleKeydown') {
      return this.translatePlayerKeydown(moduleName, handlerName, event);
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
   * Translate Cards.checkForCardClick events to commands
   */
  translateCardsClick: function (event) {
    const target = event.target;
    const cardId = target.closest('div.card')?.id;

    // Handle action buttons
    const actionButton = target.closest('div.action-button');
    if (cardId && actionButton) {
      const action = actionButton.dataset.action;
      return {
        module: 'Cards',
        type: 'cards-select-action',
        selector: `[id="${cardId}"] .action-button[data-action="${action}"]`,
      };
    }

    // Handle item clicks
    const itemContainer = target.closest('li.item:not(.is--hidden)');
    if (cardId && itemContainer) {
      const itemName = itemContainer?.dataset.item;
      return {
        module: 'Cards',
        type: 'cards-select-item',
        selector: `[id="${cardId}"] li.item:not(.is--hidden)[data-item="${itemName}"]`,
      };
    }

    return null;
  },

  /**
   * Translate Player.handleKeydown to command
   */
  translatePlayerKeydown: function (moduleName, handlerName, event) {
    if (event && event.key) {
      return {
        module: 'Player',
        type: 'move-player',
        key: event.key,
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
