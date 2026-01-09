import Props from './props.js';

let isPlaying = false;
let commandQueue = [];
let currentCommandIndex = 0;
let testTick = 0; // Independent test tick counter
let testTickInterval = null; // Interval for test ticks
let playbackTickOffset = 0; // Additional delay for slower playback
let jsErrors = [];
let logger = null; // UI logger function
let loadedTestName = null; // Name of the currently loaded test
let loadedTestData = null; // Currently loaded test data
let deferredMovement = null; // Deferred movement input (retry on next tick when isWalking = false)

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

  getTestData: function (testName) {
    const testData = {
      'test-run-1': {
        description: 'Old Villa raid',
        source: 'file',
      },
      'test-run-2': {
        description: 'Very short one',
        source: 'file',
      },
      'test-run-3': {
        description: 'First 3 days', // recyle for a test
        source: 'file',
      },
      'test-run-tutorial-1': {
        description: 'Spawn and Battle', // recyle for a test
        source: 'file',
      },
      'test-local': {
        description: 'Latest recorded test',
        source: 'localStorage',
        commands: localStorage.getItem('recordedCommands') || '[]',
        checkpoint: localStorage.getItem('testCheckpoint') || null,
      },
    };

    return testName ? testData[testName] || null : testData;
  },

  /**
   * Load test data from file
   * @param {string} testName - Name of the test file (without .json extension)
   * @returns {Promise} Resolves with test data object containing recordedCommands and checkpoint
   */
  async loadTestDataFromFile(testName) {
    try {
      const response = await fetch(`./tests/${testName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load test file: ${response.statusText}`);
      }
      const data = await response.json();

      if (!data.recordedCommands || !data.checkpoint) {
        throw new Error('Test file missing recordedCommands or checkpoint property');
      }

      return {
        description: data.description || `Test: ${testName}`,
        commands: JSON.stringify(data.recordedCommands),
        checkpoint: JSON.stringify(data.checkpoint),
      };
    } catch (e) {
      this.log(`Failed to load test file: ${e.message}`, 'error');
      throw e;
    }
  },

  /**
   * Load test data and execute a callback with the checkpoint
   * Supports both localStorage tests and file-based tests
   * @param {string} testName - Name of the test to load
   * @param {Function} onLoadCallback - Callback function to execute with the checkpoint
   */
  async loadTestData(testName, onLoadCallback) {
    try {
      let testData = this.getTestData(testName);

      if (!testData) {
        this.log(`Test data not found: ${testName}`, 'error');
        return;
      }

      // Load from file if source is 'file'
      if (testData.source === 'file') {
        testData = await this.loadTestDataFromFile(testName);
      }

      if (!testData.checkpoint) {
        this.log('No checkpoint data available for test', 'error');
        return;
      }

      loadedTestName = testName;
      loadedTestData = testData;
      const testCheckpoint = JSON.parse(testData.checkpoint);

      // Execute callback with checkpoint
      if (onLoadCallback && typeof onLoadCallback === 'function') {
        onLoadCallback(testName, testCheckpoint);
      }
    } catch (e) {
      this.log(`Failed to load test data: ${e.message}`, 'error');
    }
  },

  /**
   * Start playback from previously loaded test data
   * @param {number} tickOffset - Optional delay to add to each command tick (for slower playback)
   * @param {Function} logFunction - Optional logging function for UI feedback
   */
  startPlayback: function (tickOffset = 0, logFunction = null) {
    if (!loadedTestData) {
      this.log('No test data loaded. Use loadTestData() first', 'error');
      return;
    }

    logger = logFunction;

    try {
      commandQueue = JSON.parse(loadedTestData.commands);
      playbackTickOffset = tickOffset;
      currentCommandIndex = 0;
      jsErrors = [];
      this.log(`Starting playback with ${commandQueue.length} commands ... `, 'info', true);
      this.log(`Running ${commandQueue.length} commands`);
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
    deferredMovement = null; // Clear any deferred movement

    // Stop test tick counter
    if (testTickInterval) {
      clearInterval(testTickInterval);
      testTickInterval = null;
    }

    this.log('Playback stopped', 'info');

    if (jsErrors.length > 0) {
      this.log(`Errors encountered: ${jsErrors.length}`, 'error', true);
      console.error('Errors:', jsErrors);
    }

    if (currentCommandIndex >= commandQueue.length) {
      this.log(`Playback completed.`, 'success', true);
    } else {
      this.log(`Stopped at command ${currentCommandIndex}/${commandQueue.length}`, 'warning', true);
    }
  },

  triggerServerLog: function (message, type = 'info') {
    if (Props.getGameProp('testPlayback')) {
      const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : '';
      if (!loadedTestName || !message) return;
      console.log(`${icon} [${loadedTestName}] ${message}`);
    }
  },

  /**
   * Log message (to UI if logger provided, otherwise console)
   */
  log: function (message, type = 'info', triggerServerLog = false) {
    if (logger) {
      logger(message, type);
    } else {
      const icon =
        type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '▶️';
      console.log(`${icon} ${message}`);
    }
    if (triggerServerLog) {
      this.triggerServerLog(message, type);
    }
  },

  /**
   * Check if any commands should execute at current tick
   */
  checkAndExecuteCommands: function () {
    // First, try to execute any deferred movement (when player is no longer walking)
    if (deferredMovement && !Props.getGameProp('isWalking')) {
      try {
        this.pressKey(deferredMovement.key);
        deferredMovement = null;
      } catch (e) {
        this.log(`Failed to execute deferred movement: ${e.message}`, 'error');
        this.stopPlayback();
        return;
      }
    }

    // Execute all commands that should fire at this tick
    while (
      currentCommandIndex < commandQueue.length &&
      commandQueue[currentCommandIndex].tick + playbackTickOffset <= testTick
    ) {
      const command = commandQueue[currentCommandIndex];
      if (commandQueue[currentCommandIndex - 1]?.type !== command.type) {
        let logExtension =
          commandQueue[currentCommandIndex + 1]?.type === command.type ? ' (+)' : '';
        this.log(
          `Executing command ${currentCommandIndex + 1}/${commandQueue.length}: ${command.type}${logExtension}`
        );
      }

      try {
        this.executeCommand(command);
        currentCommandIndex++;
      } catch (e) {
        this.log(`Command execution failed: ${e.message}`, 'error', true);
        this.log(`Command: ${command.type}`, 'error', true);
        this.log(`Selector: ${command.selector}`, 'error', true);
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
    if (command.type === 'assert-prop') {
      console.log(command);
    }
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
        if (command.action === 'zombie-attack') {
          this.zombieAttackDragRelease(command.dragTarget, command.dragItem, command.dragIndex);
        } else if (command.selector) {
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
        if (command.type === 'assert-inventory-prop' && command.expectedValue) {
          const actualValue = Props.getInventoryItemNumbers();
          if (actualValue !== command.expectedValue) {
            throw new Error(
              `Assertion for '${command.prop}': expected ${command.expectedValue}, got ${actualValue}`
            );
          }
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
        if (command.type === 'assert-weapon-prop' && command.expectedValue) {
          const actualValue = Props.getWeaponTotal();
          if (actualValue !== command.expectedValue) {
            throw new Error(
              `Assertion for '${command.prop}': expected ${command.expectedValue}, got ${actualValue}`
            );
          }
        }
        break;

      case 'Cooking':
        if (command.selector) {
          this.clickElement(command.selector);
        }
        break;

      case 'Player':
        if (command.type === 'move-player' && command.key) {
          this.pressKey(command.key);
        }
        break;

      case 'Tutorial':
        if (command.type === 'battle-tutorial-input') {
          if (Props.getGameProp('tutorial') && Props.getGameProp('tutorialBattle')) {
            this.clickElement('#tutorial-battle'); // doesn't matter where we click, just needs to be a click
          } else {
            throw new Error(`Tutorial: is not in battle tutorial state`);
          }
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
   * For movement inputs: if player is currently walking, defer the input to next tick
   * @param {string} key - The key to press (e.g., 'w', 'ArrowUp')
   */
  pressKey: function (key) {
    // Check if this is a movement key and player is currently walking
    const movementKeys = [
      'w',
      'W',
      'a',
      'A',
      's',
      'S',
      'd',
      'D',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ];

    if (movementKeys.includes(key) && Props.getGameProp('isWalking')) {
      // Defer this movement input to retry on next tick when player is no longer walking
      deferredMovement = { key: key };
      return;
    }

    // Create and dispatch synthetic keydown event
    const keyEvent = new KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true,
    });

    document.body.dispatchEvent(keyEvent);
  },

  /**
   * Simulate the complicated zombie attack drag release
   * @param {string} dragTarget - The target element ID for the drag
   * @param {string} dragItem - The item being dragged
   * @param {number} dragIndex - The index of the dragged item
   */
  zombieAttackDragRelease: function (dragTarget, dragItem, dragIndex) {
    const dragTargetEl = document.querySelector(`[id="${dragTarget}"]`);
    const dragEl = document.querySelector(
      `#battle-cards [data-item="${dragItem}"][data-index="${dragIndex}"]`
    );
    if (!dragTargetEl) {
      throw new Error(`Drag target ID not found: ${dragTarget}`);
    }
    if (!dragEl) {
      throw new Error(`Drag element not found: ${dragItem} at index ${dragIndex}`);
    }
    const event = new CustomEvent('uiDragTestEvent', {
      detail: {
        dragTarget: dragTarget,
        dragItem: dragItem,
        dragIndex: dragIndex,
      },
    });
    document.dispatchEvent(event);
  },
};
