import { CharacterDefinitions } from '../../data/index.js';

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
};
