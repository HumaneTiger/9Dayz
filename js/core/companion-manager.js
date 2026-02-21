// @ts-check
/**
 * @import { Companion } from '../../data/definitions/companion-definitions.js'
 */

import { CompanionDefinitions } from '../../data/index.js';

/** @type {Companion} */
const companion = { ...CompanionDefinitions.companion };

export default {
  /**
   * @returns {Companion}
   */
  getCompanion: function () {
    return companion;
  },

  /**
   * @returns {boolean}
   */
  isCompanionActive: function () {
    return companion.active;
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
};
