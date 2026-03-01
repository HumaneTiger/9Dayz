// @ts-check
import { CharacterDefinitions } from '../../data/index.js';
import { GameState, PlayerManager } from './index.js';

export default {
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

  /* TODO: find better solution */
  /** @returns {number} */
  getNumberFilledSlots: function () {
    const characterContainer = document.getElementById('character');
    const slot1 = characterContainer?.querySelector('.slot-1');
    const slot2 = characterContainer?.querySelector('.slot-2');
    return (
      (slot1?.classList.contains('active') ? 1 : 0) + (slot2?.classList.contains('active') ? 1 : 0)
    );
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
};
