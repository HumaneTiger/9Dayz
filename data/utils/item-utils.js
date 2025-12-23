import itemsWeaponsDefinitions from '../definitions/items-weapons-definitions.js';
import characterDefinitions from '../definitions/character-definitions.js';

const { items } = itemsWeaponsDefinitions;

/**
 * Calculate damage value for an item
 * @param {string} item - Item name
 * @returns {number} Damage value
 */
export function calcItemDamage(item) {
  const itemProps = items[item];
  return itemProps[4] ? itemProps[4] : 1 + Math.round(itemProps[3] / 10);
}

/**
 * Calculate protection value for an item
 * @param {string} item - Item name
 * @returns {number} Protection value
 */
export function calcItemProtection(item) {
  const itemProps = items[item];
  if (itemProps[5]) {
    return itemProps[5];
  } else {
    return itemProps[1] > itemProps[2]
      ? Math.round(itemProps[1] / 10)
      : Math.round(itemProps[2] / 10);
  }
}

/**
 * Get item modifier for a specific character type
 * Returns modifiers for [hunger, thirst, energy]
 * @param {string} characterType - Character type (treehugger, snackivore, etc.)
 * @param {string} item - Item name
 * @returns {number[]|undefined} Array of modifiers or undefined
 */
export function getItemModifier(characterType, item) {
  const charDef = characterDefinitions[characterType];
  if (charDef?.itemModifiers) {
    return charDef.itemModifiers[item];
  }
}

/**
 * Calculate complete item properties including character modifiers
 * @param {string} item - Item name
 * @param {string} character - Character type
 * @returns {object|undefined} Item properties object or undefined
 */
export function calcItemProps(item, character) {
  const itemProps = items[item];
  const itemMods = getItemModifier(character, item);
  if (itemProps) {
    return {
      name: item,
      type: itemProps[0],
      damage: calcItemDamage(item),
      protection: calcItemProtection(item),
      food: itemMods !== undefined ? itemProps[1] + itemMods[0] : itemProps[1],
      drink: itemMods !== undefined ? itemProps[2] + itemMods[1] : itemProps[2],
      energy: itemMods !== undefined ? itemProps[3] + itemMods[2] : itemProps[3],
    };
  } else {
    console.log('No props for item ' + item);
  }
}

/**
 * Extract clean display name from item identifier
 * @param {string} item - Item identifier
 * @returns {string} Clean item name
 */
export function extractItemName(item) {
  return item
    .replace('-', ' ')
    .replace(' 1-2', '')
    .replace(' 1', '')
    .replace(' 2', '')
    .replace(' 3', '')
    .replace(' 4', '');
}
