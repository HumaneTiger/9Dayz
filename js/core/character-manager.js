// @ts-check

/**
 * @import { CharacterDefinition } from '../../data/definitions/character-definitions.js'
 */

import { CharacterDefinitions } from '../../data/index.js';
import { CompanionManager, GameState, PlayerManager } from './index.js';

export default {
  /**
   * @returns {Record<string, CharacterDefinition>}
   */
  getAllCharacterDefinitions: function () {
    return CharacterDefinitions;
  },

  /**
   * @param {string} character
   * @returns {Record<string, number>}
   */
  getInventoryPresets: function (character) {
    return CharacterDefinitions[character]?.inventoryPreset || {};
  },

  /**
   * Get item modifier for a specific character type
   * Returns modifiers for [hunger, thirst, energy]
   * @param {string} characterType - Character type (treehugger, snackivore, etc.)
   * @param {string} item - Item name
   * @returns {number[]|undefined} Array of modifiers or undefined
   */
  getItemModifier: function (characterType, item) {
    const charDef = CharacterDefinitions[characterType];
    if (charDef?.itemModifiers) {
      return charDef.itemModifiers[item];
    }
  },

  applyHighCalorieConsumptionChanges: function () {
    const character = GameState.getGameProp('character');
    if (character === 'snackivore') {
      PlayerManager.changePlayerProp('energy', -1);
      PlayerManager.changePlayerProp('thirst', -1);
      PlayerManager.changePlayerProp('food', -1);
    }
    // hardcharger will be another candidate here
  },

  /**
   * Calculates the modifyDamage for a card at the given index in the battle deck, based on the character and the item
   * @param {string} itemName
   * @returns {number} - the modifyDamage based on the character and the item
   */
  calculateModifyDamageForItem: function (itemName) {
    if (GameState.getGameProp('character') === 'snackivore') {
      const itemModifier = this.getItemModifier('snackivore', itemName);
      /** all items with negative effects (natural food) deal one extra damage */
      if (itemModifier && itemModifier[0] < 0) {
        return 1;
      }
    }
    return 0;
  },

  /**
   * @param {string} itemName
   * @returns {boolean} - whether the item should be excluded from battle cards based on the character
   */
  shouldExcludeItemFromBattle: function (itemName) {
    const character = GameState.getGameProp('character');
    if (
      character === 'craftsmaniac' &&
      ['fail', 'hacksaw', 'knife', 'mallet', 'pincers', 'spanner', 'nails'].includes(itemName)
    ) {
      return true;
    } else if (character === 'furbuddy' && ['meat', 'roasted-meat', 'bones'].includes(itemName)) {
      return true;
    }
    return false;
  },

  /**
   * @returns {boolean} - whether the character should preserve resources when upgrading weapons
   */
  shouldPreserveUpgradeResources: function () {
    const character = GameState.getGameProp('character');
    return character === 'craftsmaniac' && Math.random() * 10 <= 2.25 ? true : false;
  },

  /**
   * @param {string} actionType
   * @param {string} objectGroup
   */
  applyActionPenalty: function (actionType, objectGroup) {
    const character = GameState.getGameProp('character');
    if (character === 'furbuddy' && objectGroup === 'animal') {
      PlayerManager.changePlayerProp('health', -10);
    }
  },

  addCompanionToBattleDeck: function () {
    const character = GameState.getGameProp('character');
    return character === 'furbuddy' && CompanionManager.isCompanionActive();
  },

  /**
   *
   * @param {string} itemName
   * @returns {boolean} whether the character can eat the given item
   */
  canEatItem: function (itemName) {
    const character = GameState.getGameProp('character');
    if (character === 'furbuddy' && ['meat', 'roasted-meat'].includes(itemName)) {
      return false;
    }
    return true;
  },

  /**
   * Applies movement stat costs and starvation/dehydration health damage.
   * Includes character-specific calorie modifiers.
   * @param {boolean} noPenalty - if true, skip stat costs (e.g. first move)
   */
  applyMovementAndHealthCosts: function (noPenalty) {
    if (!noPenalty) {
      PlayerManager.changePlayerProp('energy', -1);
      PlayerManager.changePlayerProp('thirst', -2);
      PlayerManager.changePlayerProp('food', -1);
    }
    this.applyHighCalorieConsumptionChanges();
    if (PlayerManager.getProp('food') <= 0) PlayerManager.changePlayerProp('health', -5);
    if (PlayerManager.getProp('thirst') <= 0) PlayerManager.changePlayerProp('health', -5);
    if (PlayerManager.getProp('energy') <= 0) PlayerManager.changePlayerProp('energy', -5);
    PlayerManager.checkForDeath(true);
  },
};
