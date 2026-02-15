import Cards from './cards.js';
import CardsMarkup from './cards-markup.js';
import ActionSimulations from './actions/index.js';
import TimingUtils from './utils/timing-utils.js';
import AudioUtils from './utils/audio-utils.js';
import ActionsUtils from './utils/actions-utils.js';
import {
  PlayerManager,
  EventManager,
  ObjectState,
  GameState,
  ActionsManager,
  EVENTS,
} from './core/index.js';

export default {
  goToAndAction: async function (cardId, action) {
    if (!ActionsManager.isValid(cardId, action)) {
      console.log('Invalid action or card reference!', action, cardId);
      return;
    }

    const delay = ActionsManager.getActionDelay(action);
    const simulationMethod = ActionsManager.getActionMethod(action);
    /* make sure to fetch card-based values before one time actions get removed */
    const cardEnergy = ActionsManager.getCardBasedEnergy(cardId, action);
    const cardTime = ActionsManager.getCardBasedTime(cardId, action);

    if (cardEnergy && PlayerManager.getProp('energy') + cardEnergy < 0) {
      ActionsUtils.notEnoughEnergyFeedback();
      return;
    }

    if (ActionsManager.isCardActionLocked(cardId, action)) {
      ActionsUtils.actionLockedFeedback(cardId);
      return;
    }

    this.prepareAction(cardId, action);

    if (action === 'unlock-door' || action === 'break-door' || action === 'smash-window') {
      // they all have the same effect
      // if one is done and removed, all others have to be removed as well
      ActionsUtils.removeOneTimeActions(cardId, 'unlock-door');
      ActionsUtils.removeOneTimeActions(cardId, 'break-door');
      ActionsUtils.removeOneTimeActions(cardId, 'smash-window');
    } else {
      ActionsUtils.removeOneTimeActions(cardId, action);
    }

    await TimingUtils.wait(delay);

    const simulateFunction = ActionSimulations[simulationMethod];
    simulateFunction.call(null, this, cardId, cardTime, cardEnergy);
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
    const label = ActionsManager.getActionLabel(action);
    AudioUtils.sfx('click');
    PlayerManager.lockMovement(true);
    Cards.disableActions();
    CardsMarkup.showActionFeedback(cardId, label);
    if (action !== 'lure') {
      EventManager.emit(EVENTS.PLAYER_MOVE_TO, { x: object.x, y: object.y });
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
};
