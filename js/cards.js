import Audio from './audio.js';
import Props from './props.js';
import Player from './player.js';
import Map from './map.js';
import Tutorial from './tutorial.js';
import Ui from './ui.js';
import CardsMarkup from './cards-markup.js';
import ActionsOrchestration from './actions-orchestration.js';
import ActionsUtils from './utils/actions-utils.js';
import { EventManager, EVENTS, CardsManager, ActionsManager, ObjectState } from './core/index.js';

//var cardDeck = [];
var lastHoverTarget;

export default {
  init: function () {
    document.body.addEventListener('mouseover', this.checkForCardHover.bind(this));
    document.body.addEventListener('mousedown', this.checkForCardClick.bind(this));
    EventManager.on(
      EVENTS.GAME_PROP_CHANGED,
      ({ prop, value }) => {
        if (prop === 'timeIsUnity') {
          this.handleTimeChange(value);
        }
      },
      { prop: 'timeIsUnity', value: Props.getGameProp('timeIsUnity') }
    );
  },

  handleTimeChange: function (time) {
    const hour = time.todayHours;
    const ticksPerHour = Props.getGameProp('timeConfig').ticksPerHour;
    // Only execute on new hour (when gameTick is divisible by ticksPerHour)
    if (time.gameTick % ticksPerHour === 0 && (hour === 21 || hour === 5)) {
      this.switchDayNight();
    }
  },

  checkForCardClick: function (ev) {
    const target = ev.target;
    const cardId = target.closest('div.card')?.id;
    const actionButton = target.closest('div.action-button');
    const itemContainer = target.closest('li.item:not(.is--hidden)');
    const leftMouseButton = ev.button === 0;

    if (cardId && !Props.getGameProp('gamePaused')) {
      const object = Props.getObject(cardId);

      ev.preventDefault();
      ev.stopPropagation();

      if (actionButton && leftMouseButton && !object.disabled) {
        const action = actionButton.dataset.action;
        ActionsOrchestration.goToAndAction(cardId, action);
      } else if (itemContainer) {
        const itemName = itemContainer?.dataset.item;
        const itemAmount = object.items.find(singleItem => singleItem.name === itemName)?.amount;
        if (itemAmount && leftMouseButton) {
          ActionsUtils.grabItem(cardId, itemContainer, itemName);
        }
      }
    }
  },

  checkForCardHover: function (ev) {
    const target = ev.target;

    const cardId = target.closest ? target.closest('div.card')?.id : null;
    const hoverButton = target.closest ? target.closest('div.action-button') : null;

    if (!Props.getGameProp('gamePaused')) {
      if (!cardId || cardId !== lastHoverTarget) {
        const cardRef = this.getCardById(lastHoverTarget);
        if (cardRef) {
          if (!Props.getGameProp('battle')) {
            cardRef.style.zIndex = cardRef.dataset.oldZindex;
          }
          delete cardRef.dataset.oldZindex;
          Map.noHighlightObject(lastHoverTarget);
          lastHoverTarget = undefined;
        }
      }
      if (cardId) {
        if (lastHoverTarget !== cardId) {
          lastHoverTarget = cardId;
          const cardRef = this.getCardById(cardId);
          if (!Props.getGameProp('battle')) {
            cardRef.dataset.oldZindex = cardRef.style.zIndex;
            cardRef.style.zIndex = 200;
          }
          if (hoverButton) {
            cardRef.classList.add('hover-button');
          } else {
            cardRef.classList.remove('hover-button');
          }
          Map.highlightObject(cardId);
        }
        if (hoverButton) {
          const action = hoverButton.dataset?.action;
          if (action && (action === 'rest' || action === 'sleep')) {
            this.previewStatsChange(action, cardId);
          }
        } else {
          Player.resetPreviewProps();
        }
      }
    }
  },

  previewStatsChange: function (action, cardId) {
    const object = Props.getObject(cardId);
    const actionObject = object.actions.find(singleAction => singleAction.id === action);
    if (!actionObject.locked) {
      let energy = actionObject.energy;
      if (actionObject.id === 'rest') {
        if (Props.getGameProp('timeMode') === 'night') {
          energy += 5;
        }
        Player.previewProps('health', Math.floor(energy / 2));
        Player.previewProps('food', -10);
        Player.previewProps('thirst', -14);
        Player.previewProps('energy', energy);
      } else if (actionObject.id === 'sleep') {
        if (Props.getGameProp('timeMode') === 'night') {
          energy += 20;
        }
        Player.previewProps('health', Math.floor(energy / 2));
        Player.previewProps('food', -18);
        Player.previewProps('thirst', -24);
        Player.previewProps('energy', energy);
      }
    }
  },

  getCardById: function (cardId) {
    return document.getElementById(cardId);
  },

  showAllZedsNearby: function () {
    CardsManager.getCardDeck().forEach(card => {
      let object = Props.getObject(card.id);
      if (object.group === 'zombie' && object.distance < 2.5 && !object.dead) {
        const cardRef = this.getCardById(card.id);
        object.active = true;
        cardRef && cardRef.classList.remove('is--hidden'); // not strictly needed, but because of timeout crazieness
        cardRef && cardRef.classList.remove('out-of-queue');
      }
    });
  },

  addObjectsByIds: function (objectIds) {
    CardsManager.addObjectIdsToCardDeck(objectIds);
    this.renderCardDeck();
  },

  removeAction(actionId, cardRef, object) {
    // find index and remove if present
    if (!object.actions) {
      console.log('object has no actions', object);
      return;
    }
    const idx = object.actions.findIndex(a => a.id === actionId);
    if (idx !== -1) {
      object.actions.splice(idx, 1);
    }
    cardRef.querySelector('li.' + actionId)?.remove();
    CardsMarkup.hideActionFeedback(cardRef);
  },

  revealAction(actionId, cardRef, object) {
    // only reveal if action exists on the object
    if (object.actions.some(a => a.id === actionId)) {
      cardRef?.querySelector('li.' + actionId)?.classList.remove('is--hidden');
    }
  },

  calculateCardDeckProperties: function () {
    CardsManager.updateCardDeckProperties();
    CardsManager.getCardDeck().forEach(card => {
      ActionsManager.updateActionsForObject(card.id);
    });
  },

  renderCardDeck: function () {
    this.addSpecialEventCards();
    this.calculateCardDeckProperties();
    let cardDeck = CardsManager.getCardDeck();
    cardDeck.sort(this.compare);

    cardDeck?.forEach(card => {
      const object = Props.getObject(card.id);
      if (!object.discovered) {
        object.discovered = true;
        CardsMarkup.createCardMarkup(card.id);
        /* candidates for event bus */
        if (object.group === 'zombie') {
          if (object.name === 'rat') {
            Audio.sfx('rat-squeaks');
          } else if (object.name === 'bee') {
            Audio.sfx('bee-appears');
          } else {
            Audio.sfx('zed-appears');
          }
        }
        if (object.group === 'event') {
          if (object.title === 'You found it!') {
            Ui.hideUI();
            document.getElementById('inventory').classList.add('the-end');
          }
        }
      }
    });

    this.updateCardDeck();
    CardsManager.cleanupCardDeck(); // call directly after update, as the removed card effect has to be applied before

    this.switchDayNight();
    this.logDeck();
  },

  updateCardDeck: function () {
    CardsMarkup.updateCardDeckMarkup();
  },

  addSpecialEventCards: function () {
    /* candidates for event bus */
    if (Props.getGameProp('tutorial')) {
      const specialEventObjectIds = Tutorial.checkForSpecialEvents();
      specialEventObjectIds?.forEach(objectId => {
        let object = ObjectState.getObject(objectId);
        if (!object.discovered && !object.removed) {
          CardsManager.addCardToCardDeck({
            id: objectId,
            distance: -1,
          });
        }
      });
    }
  },

  logDeck: function () {},

  switchDayNight: function () {
    CardsManager.getCardDeck().forEach(card => {
      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);
      if (cardRef && !object.removed) {
        if (object.active) {
          if (Props.getGameProp('timeMode') === 'day') {
            cardRef.classList.remove('night');
            cardRef.classList.add('day');
          } else {
            cardRef.classList.remove('day');
            cardRef.classList.add('night');
          }
        }
      }
    });
  },

  disableActions: function () {
    CardsManager.getCardDeck().forEach(function (card) {
      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);
      if (object.group !== 'event') {
        object.disabled = true;
        cardRef && cardRef.classList.add('actions-locked');
      }
    });
    document.querySelector('#craft')?.classList.add('actions-locked');
    document.querySelector('#character')?.classList.add('actions-locked');
  },

  enableActions: function () {
    CardsManager.getCardDeck().forEach(function (card) {
      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);
      object.disabled = false;
      cardRef && cardRef.classList.remove('actions-locked');
    });
    document.querySelector('#craft')?.classList.remove('actions-locked');
    document.querySelector('#character')?.classList.remove('actions-locked');
  },

  removeCard: function (cardId) {
    const object = Props.getObject(cardId);
    object.removed = true;
  },

  compare: function (a, b) {
    if (a.distance < b.distance) {
      return -1;
    }
    if (a.distance > b.distance) {
      return 1;
    }
    return 0;
  },
};
