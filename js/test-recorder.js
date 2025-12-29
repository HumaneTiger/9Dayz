import Events, { EVENTS } from './events.js';
import Props from './props.js';
import Checkpoint from './checkpoint.js';
import Start from './start.js';
import Ui from './ui.js';
import Character from './character.js';

let isRecording = false;
let recordedCommands = [];
let testTick = 0; // Independent test tick counter
let testTickInterval = null; // Interval for test ticks
let logger = null; // UI logger function
let assertionTimeouts = {}; // Debounce pending assertions

export default {
  init: function () {
    // Incoming game events will be translated into assertion checks
    Events.on(EVENTS.PLAYER_PROP_CHANGED, ({ prop, change, newValue }) => {
      if (isRecording && change !== 0) {
        const assertion = this.translateToAssertion('player-prop', prop, newValue);
        if (assertion) {
          this.recordAssertion(assertion);
        }
      }
    });
    Events.on(EVENTS.INVENTORY_CHANGED, ({ oldTotal, newTotal }) => {
      if (isRecording && oldTotal !== newTotal) {
        const assertion = this.translateToAssertion('inventory-prop', 'total', newTotal);
        if (assertion) {
          this.recordAssertion(assertion);
        }
      }
    });
  },

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
   * Dispatcher for translating events to semantic assertions
   * @param {string} property - Type of property ('player-prop' or 'inventory-prop')
   * @param {string} propName - Name of the property
   * @param {*} newValue - New value of the property
   * @returns {Object|null} Assertion object or null if not translatable
   */
  translateToAssertion: function (property, propName, newValue) {
    if (property === 'player-prop') {
      return this.translatePlayerPropAssertion(propName, newValue);
    }
    if (property === 'inventory-prop') {
      return this.translateInventoryPropAssertion(propName, newValue);
    }
    return null;
  },

  /**
   * Translate player property changes to assertions
   */
  translatePlayerPropAssertion: function (propName, newValue) {
    return {
      module: 'Player',
      type: 'assert-player-prop',
      prop: propName,
      expectedValue: newValue,
    };
  },

  /**
   * Translate inventory property changes to assertions
   */
  translateInventoryPropAssertion: function (propName, newValue) {
    return {
      module: 'Items',
      type: 'assert-inventory-prop',
      prop: propName,
      expectedValue: newValue,
    };
  },

  /**
   * Record assertion with debouncing and logging
   * Debounces rapid changes to capture only the final stable state
   * @param {Object} assertion - Assertion object to record
   * @param {number} debounceMs - Debounce delay in milliseconds
   * @param {number} recordTickDelay - Delay in ticks before recording the assertion
   */
  recordAssertion: function (assertion, debounceMs = 50, recordTickDelay = 1) {
    const key = `${assertion.module}:${assertion.prop || assertion.type}`;

    // Clear pending timeout for this assertion
    if (assertionTimeouts[key]) {
      clearTimeout(assertionTimeouts[key]);
    }

    // Debounce: record only after debounceMs of no changes
    assertionTimeouts[key] = setTimeout(() => {
      recordedCommands.push({
        ...assertion,
        tick: testTick + recordTickDelay, // Record assertion at next tick
      });

      // Log to UI if logger provided
      if (logger) {
        logger(`Recorded assertion: ${assertion.type} at tick ${testTick + recordTickDelay}`);
      }
    }, debounceMs);
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
    if (moduleName === 'Ui' && handlerName === 'handleClick') {
      return this.translateUiClick(event);
    }
    if (moduleName === 'Ui' && handlerName === 'mouseUp') {
      return this.translateUiMouseUp(event);
    }
    if (moduleName === 'Cards' && handlerName === 'checkForCardClick') {
      return this.translateCardsClick(event);
    }
    if (moduleName === 'Items' && handlerName === 'checkForSlotClick') {
      return this.translateItemsClick(event);
    }
    if (moduleName === 'Crafting' && handlerName === 'checkCraftActionClick') {
      return this.translateCraftActionClick(event);
    }
    if (moduleName === 'Character' && handlerName === 'checkForSlotClick') {
      return this.translateCharacterSlotClick(event);
    }
    if (moduleName === 'Cooking' && handlerName === 'checkForCardClick') {
      return this.translateCookingClick(event);
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

      // action buttons (e.g., start game, settings)
      const actionType = Start.getActionType(actionButton);
      if (actionType) {
        return {
          module: 'Start',
          type: 'start-button',
          action: actionType,
          selector: `.button.${actionType}`,
        };
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
   * Translate Ui.handleClick events to commands
   */
  translateUiClick: function (event) {
    const target = event.target;
    const clickAction = target.closest('#actions');
    const clickBattleCards = target.closest('#battle-cards');
    const mapClick = target.closest('#maximap');
    const leftMouseButton = event.button === 0;

    // Handle action buttons
    if (clickAction && leftMouseButton) {
      const actionButton = target.closest('li');

      const actionType = Ui.getActionType(actionButton);
      if (actionType) {
        return {
          module: 'Ui',
          type: 'ui-button',
          action: actionType,
          selector: `#actions li.${actionType}`,
        };
      }
    }

    // Handle battle buttons
    if (clickBattleCards && leftMouseButton) {
      const endTurnButton = target.closest('.end-turn');

      if (endTurnButton) {
        return {
          module: 'Ui',
          type: 'ui-button',
          action: 'end-turn',
          selector: `#battle-cards .end-turn`,
        };
      }
    }

    // handle map
    if (mapClick && leftMouseButton) {
      return {
        module: 'Ui',
        type: 'ui-map-click',
        selector: '#maximap',
      };
    }

    return null;
  },

  /**
   * Translate Ui.mouseUp events to commands
   */
  translateUiMouseUp: function (event) {
    let dragTarget = Ui.getDragTarget(event);

    // Handle mouse release after dragging a card onto a zombie
    if (dragTarget) {
      if (dragTarget.classList.contains('zombie')) {
        const dragElement = Ui.getDragElement();
        if (dragElement && dragElement.dataset.item) {
          return {
            module: 'Ui',
            type: 'ui-drag',
            action: 'zombie-attack',
            dragTarget: dragTarget.id,
            dragItem: dragElement.dataset.item,
          };
        }
      }
    }

    return null;
  },

  /**
   * Serialize a mouse event to a plain object for localStorage
   * @param {MouseEvent} event - The mouse event to serialize
   * @returns {Object} Serializable event data
   */
  serializeMouseEvent: function (event) {
    return {
      button: event.button,
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
    };
  },

  /**
   * Translate Cards.checkForCardClick events to commands
   */
  translateCardsClick: function (event) {
    const target = event.target;
    const cardId = target.closest('div.card')?.id;
    const leftMouseButton = event.button === 0;

    // Handle action buttons
    const actionButton = target.closest('div.action-button');
    if (cardId && actionButton && leftMouseButton) {
      const action = actionButton.dataset.action;
      return {
        module: 'Cards',
        type: 'cards-select-action',
        selector: `[id="${cardId}"] .action-button[data-action="${action}"]`,
      };
    }

    // Handle item clicks
    const itemContainer = target.closest('li.item:not(.is--hidden)');
    if (cardId && itemContainer && leftMouseButton) {
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
   * Translate Items.checkForSlotClick to command
   */

  translateItemsClick: function (event) {
    const target = event.target;
    const inventorySlot = target.closest('#inventory');
    const leftMouseButton = event.button === 0;

    if (inventorySlot && leftMouseButton) {
      const itemSlot = target.closest('div.slot.active');
      if (itemSlot) {
        const item = itemSlot.dataset.item;
        return {
          module: 'Items',
          type: 'inventory-select-slot',
          selector: `#inventory .slot[data-item="${item}"]`,
        };
      }
    }

    return null;
  },

  /**
   * Translate Cooking.checkForCookingClick to command
   */

  translateCookingClick: function (event) {
    const target = event.target;
    const cookingContainer = target.closest('.card.cooking-mode');
    const actionSlotActive = target.closest('div.slot.action.active');
    const actionButton = target.closest('div.action-button');
    const leftMouseButton = event.button === 0;

    if (cookingContainer) {
      if (actionSlotActive && leftMouseButton) {
        const recipe = actionSlotActive.dataset.item;
        if (recipe) {
          return {
            module: 'Cooking',
            type: 'cooking-select-slot',
            selector: `#cards .card.cooking-mode ul.cooking .slot[data-item="${recipe}"]`,
          };
        }
      } else if (
        actionButton &&
        leftMouseButton &&
        actionButton.dataset.action === 'close-cooking'
      ) {
        return {
          module: 'Cooking',
          type: 'cooking-close-card',
          selector: `#cards .card.cooking-mode .action-button[data-action="close-cooking"]`,
        };
      }
    }

    return null;
  },

  /**
   * Translate Crafting.checkCraftActionClick to command
   */
  translateCraftActionClick: function (event) {
    const target = event.target;
    const craftAction = target.closest('#craft');
    const clickButton = target.closest('.button-craft.active');
    const navButton = target.closest('.button-next') || target.closest('.button-prev');
    const leftMouseButton = event.button === 0;

    if (craftAction) {
      if (clickButton && leftMouseButton) {
        const item = clickButton.dataset.item;
        return {
          module: 'Crafting',
          type: 'crafting-craft-item',
          selector: `#craft .button-craft[data-item="${item}"]`,
        };
      } else if (navButton && leftMouseButton) {
        if (navButton.classList.contains('button-next')) {
          return {
            module: 'Crafting',
            type: 'crafting-navigate-next',
            selector: `#craft .button-next`,
          };
        } else if (navButton.classList.contains('button-prev')) {
          return {
            module: 'Crafting',
            type: 'crafting-navigate-prev',
            selector: `#craft .button-prev`,
          };
        }
      }
    }

    return null;
  },

  translateCharacterSlotClick: function (event) {
    const target = event.target;
    const characterPanel = target.closest('#character');
    const actionButton = target.closest('div.action-button');
    const upgradeButton = target.closest('div.upgrade:not(.nope)');
    const cardSlot = target.closest('.card');
    const leftMouseButton = event.button === 0;

    if (characterPanel && cardSlot) {
      if (actionButton && leftMouseButton) {
        const action = actionButton.dataset.action;
        const weaponName = cardSlot.dataset.item;
        return {
          module: 'Character',
          type: 'weapon-action-button',
          selector: `#character .card[data-item="${weaponName}"] .action-button[data-action="${action}"]`,
        };
      } else if (upgradeButton && leftMouseButton) {
        const weaponName = cardSlot.dataset.item;
        const upgradeType = Character.getUpgradeType(upgradeButton);
        if (upgradeType) {
          return {
            module: 'Character',
            type: 'weapon-select-upgrade',
            selector: `#character .card[data-item="${weaponName}"]  div.upgrade.${upgradeType}`,
          };
        }
      }
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
