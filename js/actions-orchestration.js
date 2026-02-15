import Props from './props.js';
import Audio from './audio.js';
import Player from './player.js';
import Cards from './cards.js';
import CardsMarkup from './cards-markup.js';
import Actions from './actions.js';
import TimingUtils from './utils/timing-utils.js';
import AudioUtils from './utils/audio-utils.js';
import {
  PlayerManager,
  EventManager,
  ObjectState,
  GameState,
  ActionsManager,
  EVENTS,
} from './core/index.js';
import { ActionsDefinitions } from '../data/definitions/index.js';

export default {
  goToAndAction: async function (cardId, action) {
    const { actionObject, actionProps, isValid } = ActionsManager.getActionData(cardId, action);

    if (!isValid) {
      console.log('Invalid action or card reference!', action, cardId);
      return;
    }

    if (actionObject.energy && PlayerManager.getProp('energy') + actionObject.energy < 0) {
      this.notEnoughEnergyFeedback();
    } else if (actionObject?.locked) {
      this.actionLockedFeedback(cardId);
    } else {
      this.prepareAction(cardId, action);
      if (action === 'unlock-door' || action === 'break-door' || action === 'smash-window') {
        // they all have the same effect
        // if one is done and removed, all others have to be removed as well
        this.removeOneTimeActions(cardId, 'unlock-door');
        this.removeOneTimeActions(cardId, 'break-door');
        this.removeOneTimeActions(cardId, 'smash-window');
      } else {
        this.removeOneTimeActions(cardId, action);
      }
      await TimingUtils.wait(actionProps.delay);
      const simulateMethod = Actions[actionProps.method];
      simulateMethod.call(null, this, cardId, actionObject.time, actionObject.energy);
    }
  },

  fastForward: function (
    actionsOrchestration,
    callbackfunction,
    cardId,
    time,
    newSpeedOpt,
    energy
  ) {
    const timeConfig = GameState.getGameProp('timeConfig');
    const defaultThreshold = timeConfig.gameTickThreshold;
    const newThreshold = newSpeedOpt || 400;
    if (time) {
      let ticks = parseInt(time) / 10;
      timeConfig.gameTickThreshold = newThreshold;
      GameState.setGameProp('timeConfig', timeConfig);
      window.setTimeout(
        (defaultThreshold, cardId) => {
          const timeConfig = GameState.getGameProp('timeConfig');
          timeConfig.gameTickThreshold = defaultThreshold;
          GameState.setGameProp('timeConfig', timeConfig);
          callbackfunction.call(null, actionsOrchestration, cardId, energy);
        },
        ticks * newThreshold,
        defaultThreshold,
        cardId
      );
    }
  },

  prepareAction: function (cardId, action) {
    const object = ObjectState.getObject(cardId);
    const actionProps = ActionsDefinitions.actionProps[action];
    AudioUtils.sfx('click');
    PlayerManager.lockMovement(true);
    Cards.disableActions();
    CardsMarkup.showActionFeedback(cardId, actionProps.label);
    if (action !== 'lure') {
      EventManager.emit(EVENTS.PLAYER_MOVE_TO, { x: object.x, y: object.y });
    }
  },

  notEnoughEnergyFeedback: async function () {
    const energyMeter = document.querySelector('#properties li.energy');
    energyMeter?.classList.add('heavy-shake');
    await TimingUtils.wait(200);
    energyMeter?.classList.remove('heavy-shake');
    AudioUtils.sfx('nope');
  },

  actionLockedFeedback: async function (cardId) {
    const cardRef = Cards.getCardById(cardId);
    cardRef?.classList.add('card-shake');
    await TimingUtils.wait(200);
    cardRef?.classList.remove('card-shake');
    AudioUtils.sfx('nope');
  },

  removeOneTimeActions: function (cardId, action) {
    const object = ObjectState.getObject(cardId);
    const actionProps = ActionsDefinitions.actionProps[action];
    const cardRef = Cards.getCardById(cardId);
    if (actionProps.oneTime) {
      for (let i = object.actions.length - 1; i >= 0; i--) {
        if (object.actions[i].id === action) {
          if (!(object.infested && (action === 'search' || action === 'gather'))) {
            cardRef.querySelector('li.' + action).remove();
            object.actions.splice(i, 1);
          }
        }
      }
    }
  },

  goBackFromAction: async function (cardId) {
    this.endAction(cardId);
    EventManager.emit(EVENTS.PLAYER_UPDATE, { noPenalty: true });
    await TimingUtils.wait(1000);
    PlayerManager.lockMovement(false);
  },

  endAction: function (cardId) {
    let cardRef = Cards.getCardById(cardId);
    CardsMarkup.hideActionFeedback(cardRef);
  },

  grabItem: async function (cardId, container, itemName) {
    const object = Props.getObject(cardId);
    const itemAmount = object.items.find(singleItem => singleItem.name === itemName)?.amount;
    let cardRef = Cards.getCardById(cardId);
    if (Props.isWeapon(itemName)) {
      // spawn card representing the grabbed weapon item
      Props.setupWeapon(Player.getPlayerPosition().x, Player.getPlayerPosition().y, itemName);
    } else if (itemName === 'crate') {
      // spawn card representing the grabbed crate item
      Props.setupBuilding(
        Player.getPlayerPosition().x,
        Player.getPlayerPosition().y,
        new Array('crate')
      );
    } else {
      Props.addItemToInventory(itemName, itemAmount);
    }
    object.items.find(singleItem => singleItem.name === itemName).amount = 0;
    Audio.sfx('pick', 0, 0.1);
    container.classList.add('transfer');
    await TimingUtils.waitForTransition(container);
    if (cardRef) {
      container.classList.add('is--hidden');
      if (itemName === 'crate' || Props.isWeapon(itemName)) {
        Player.findAndHandleObjects();
      } // this LOC must be placed here, otherwise the "grab slot" for weapons isn't removed correctly
      if (
        object.items.filter(singleItem => singleItem.amount > 0).length === 0 &&
        !cardRef.querySelectorAll('ul.items li.preview:not(.is--hidden)')?.length
      ) {
        Cards.renderCardDeck();
      }
    }
  },

  gotIt: function (cardId) {
    const object = Props.getObject(cardId);
    if (object && object.title === 'You found it!') {
      Player.checkForWin();
    } else if (object.title === 'Waking Up') {
      document.getElementById('player').classList.remove('highlight');
      document.getElementById('player-hint').classList.add('is--hidden');
    }
    Cards.removeCard(cardId);
    Player.lockMovement(false);
    Player.updatePlayer(true);
    Cards.renderCardDeck();
  },
};
