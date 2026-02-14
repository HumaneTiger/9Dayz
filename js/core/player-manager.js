// @ts-check
/**
 * @import { PlayerProps, Companion } from '../../data/definitions/player-definitions.js'
 */

import { EventManager, EVENTS } from './index.js';
import { PlayerDefinitions } from '../../data/index.js';
import GameState from './game-state.js';

/** @type {PlayerProps} */
const playerProps = { ...PlayerDefinitions.PlayerProps };

/** @type {Companion} */
const companion = { ...PlayerDefinitions.Companion };

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
    if (typeof change === 'string') {
      console.error('change must be a number, got string:', change);
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
   * @returns {Companion}
   */
  getCompanion: function () {
    return companion;
  },

  /**
   * @param {Partial<Companion>} newCompanion
   * @returns {void}
   */
  setCompanion: function (newCompanion) {
    Object.assign(companion, newCompanion); // Updates properties, keeps same reference
  },

  /**
   * @param {Companion} companionData
   * @returns {void}
   */
  addCompanion: function (companionData) {
    this.setCompanion({
      active: true,
      sort: companionData.sort,
      name: companionData.name,
      damage: companionData.damage,
      health: companionData.health,
      maxHealth: companionData.maxHealth,
      protection: companionData.protection,
    });
  },

  /**
   * @param {boolean} moveable
   * @returns {void}
   */
  lockMovement: function (moveable) {
    GameState.setGameProp('isMoveLocked', moveable);
  },
};
