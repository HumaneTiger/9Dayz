// @ts-check
/**
 * @import { CompanionDefinition } from '../../data/definitions/companion-definitions.js'
 * @import { Inventory } from './inventory-manager.js'
 */

import { CompanionDefinitions } from '../../data/index.js';
import InventoryManager from './inventory-manager.js';

/** @type {Record<string, CompanionDefinition>} */
const companions = CompanionDefinitions.companions;

/** @type {Inventory} */
const inventory = InventoryManager.getInventory();

export default {
  /**
   * Get companion definition by name
   * @param {string} companionName - Companion name
   * @returns {CompanionDefinition}
   */
  getCompanionDefinition: function (companionName) {
    return companions[companionName];
  },

  /**
   * @param {string} name - Possible companion name
   * @returns {boolean} True if name is a valid companion, false otherwise
   */
  isCompanion: function (name) {
    return !!companions[name];
  },

  /**
   * @returns {CompanionDefinition | undefined}
   */
  getCompanionFromInventory: function () {
    /* there can only be one companion at a time, so we take the first one in the companions object */
    const companionName = Object.keys(inventory.companions)[0];
    return inventory.companions[companionName];
  },

  /**
   * @returns {boolean}
   */
  isCompanionActive: function () {
    return Object.keys(inventory.companions).length > 0;
  },

  /**
   *
   * @param {string} companionName
   * @param {CompanionDefinition} props
   * @returns {void}
   */
  addCompanionToInventory: function (companionName, props) {
    if (this.isCompanionActive()) {
      console.warn('Cannot add companion "' + companionName + '" to inventory');
      return;
    }
    inventory.companions[companionName] = props;
  },

  /**
   * Removes companion from inventory (used when companion is lost or removed)
   * @returns {void}
   */
  removeCompanionFromInventory: function () {
    inventory.companions = {};
  },

  /**
   * @returns {string} HTML markup representing companion's health
   */
  generateHealthMarkup: function () {
    const companion = this.getCompanionFromInventory();
    if (!companion) {
      return '';
    }
    const maxHealthChars = '♥'.repeat(companion.maxHealth);
    return (
      maxHealthChars.substring(0, companion.health) +
      '<u>' +
      maxHealthChars.substring(0, maxHealthChars.length - companion.health) +
      '</u>'
    );
  },
};
