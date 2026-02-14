import Props from './props.js';
import AudioUtils from './utils/audio-utils.js';
import Player from './player.js';
import Cards from './cards.js';
import CardsMarkup from './cards-markup.js';
import TimingUtils from './utils/timing-utils.js';
import { ActionsDefinitions } from '../data/definitions/index.js';
import { GameState, ObjectState } from './core/index.js';

export default {
  goToAndAction: async function (cardId, action, scope) {
    const object = Props.getObject(cardId);
    const actionObject = object.actions.find(singleAction => singleAction.id === action);
    const actionProps = ActionsDefinitions.actionProps[action];
    const cardRef = Cards.getCardById(cardId);

    if (actionObject && actionProps && cardRef) {
      if (actionObject.energy && Player.getProp('energy') + actionObject.energy < 0) {
        this.notEnoughEnergyFeedback();
      } else if (actionObject?.locked) {
        this.actionLockedFeedback(cardRef);
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
        const simulateMethod = scope[actionProps.method];
        simulateMethod.call(scope, cardId, actionObject.time, actionObject.energy);
      }
    } else {
      console.log('Invalid action or card reference!', action, cardId);
    }
  },

  prepareAction: function (cardId, action) {
    const object = Props.getObject(cardId);
    const actionProps = ActionsDefinitions.actionProps[action];
    AudioUtils.sfx('click');
    Player.lockMovement(true);
    Cards.disableActions();
    CardsMarkup.showActionFeedback(cardId, actionProps.label);
    if (action !== 'lure') {
      Player.movePlayerTo(object.x, object.y);
    }
  },

  notEnoughEnergyFeedback: async function () {
    const energyMeter = document.querySelector('#properties li.energy');
    energyMeter?.classList.add('heavy-shake');
    await TimingUtils.wait(200);
    energyMeter?.classList.remove('heavy-shake');
    AudioUtils.sfx('nope');
  },

  actionLockedFeedback: async function (cardRef) {
    cardRef?.classList.add('card-shake');
    await TimingUtils.wait(200);
    cardRef?.classList.remove('card-shake');
    AudioUtils.sfx('nope');
  },

  removeOneTimeActions: function (cardId, action) {
    const object = Props.getObject(cardId);
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
    Player.updatePlayer(true);
    await TimingUtils.wait(1000);
    Player.lockMovement(false);
  },

  endAction: function (cardId) {
    let cardRef = Cards.getCardById(cardId);
    CardsMarkup.hideActionFeedback(cardRef);
  },

  fastForward: function (callbackfunction, cardId, time, newSpeedOpt, energy) {
    const timeConfig = Props.getGameProp('timeConfig');
    const defaultThreshold = timeConfig.gameTickThreshold;
    const newThreshold = newSpeedOpt || 400;
    if (time) {
      let ticks = parseInt(time) / 10;
      timeConfig.gameTickThreshold = newThreshold;
      Props.setGameProp('timeConfig', timeConfig);
      window.setTimeout(
        (defaultThreshold, cardId) => {
          const timeConfig = Props.getGameProp('timeConfig');
          timeConfig.gameTickThreshold = defaultThreshold;
          Props.setGameProp('timeConfig', timeConfig);
          callbackfunction.call(this, cardId, energy);
        },
        ticks * newThreshold,
        defaultThreshold,
        cardId
      );
    }
  },
};
