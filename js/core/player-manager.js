// @ts-check
/**
 * @import { PlayerProps } from '../../data/definitions/player-definitions.js'
 */

import { EventManager, EVENTS, GameState } from './index.js';
import { PlayerDefinitions } from '../../data/index.js';

/** @type {PlayerProps} */
const playerProps = { ...PlayerDefinitions.PlayerProps };

export default {
  /**
   * @returns {PlayerProps}
   */
  getPlayerProps: function () {
    return playerProps;
  },

  /**
   * @param {keyof PlayerProps} prop
   * @returns {number}
   */
  getProp: function (prop) {
    return playerProps[prop];
  },

  /**
   * @param {keyof PlayerProps} prop
   * @param {number} change
   * @returns {number}
   */
  changePlayerProp: function (prop, change) {
    if (typeof change === 'string' || isNaN(change)) {
      console.info('[changePlayerProp] change must be a number, got string or NaN:', change);
      return playerProps[prop];
    }
    const oldValue = playerProps[prop];
    playerProps[prop] += change;
    if (playerProps[prop] < 0) playerProps[prop] = 0;
    if (playerProps[prop] > 100) playerProps[prop] = 100;

    // EVENT: Notify UI that player property changed
    EventManager.emit(EVENTS.PLAYER_PROP_CHANGED, {
      prop,
      change,
      oldValue,
      newValue: playerProps[prop],
    });

    return playerProps[prop];
  },

  /**
   * @param {boolean} moveable
   * @returns {void}
   */
  lockMovement: function (moveable) {
    GameState.setGameProp('isMoveLocked', moveable);
  },
};
