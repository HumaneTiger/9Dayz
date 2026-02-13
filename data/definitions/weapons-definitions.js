// @ts-check

/**
 * @typedef {Object} WeaponDefinition
 * @property {number} attack
 * @property {number} defense
 * @property {number} durability
 * @export
 */

/**
 * @typedef {Object} WeaponProps
 * @property {number} amount
 * @property {string} name
 * @property {number} damage
 * @property {number} protection
 * @property {number} durability
 * @export
 */

/**
 * @typedef {Object} WeaponUpgrade
 * @property {number} amount
 * @property {string} item
 * @export
 */

/**
 * @typedef {Object} WeaponUpgrades
 * @property {WeaponUpgrade} [attack]
 * @property {WeaponUpgrade} [defense]
 * @property {WeaponUpgrade} [durability]
 * @export
 */

/** @type {Record<string, WeaponDefinition>} */
const weapons = {
  'baseball-bat': { attack: 10, defense: 3, durability: 4 },
  wrench: { attack: 14, defense: 4, durability: 4 },
  axe: { attack: 12, defense: 6, durability: 4 },
  'improvised-axe': { attack: 8, defense: 4, durability: 3 },
  'wooden-club': { attack: 6, defense: 3, durability: 3 },
  'improvised-whip': { attack: 3, defense: 3, durability: 3 },
  'fishing-rod': { attack: 2, defense: 1, durability: 4 },
};

/** @type {Record<string, WeaponUpgrades>} */
const weaponPropsUpgrades = {
  'baseball-bat': {
    attack: { amount: 1, item: 'nails' },
    defense: { amount: 2, item: 'glue' },
    durability: { amount: 1, item: 'tape' },
  },
  wrench: {
    attack: { amount: 1, item: 'spanner' },
    defense: { amount: 1, item: 'brush' },
    durability: { amount: 1, item: 'tape' },
  },
  axe: {
    attack: { amount: 1, item: 'fail' },
    defense: { amount: 2, item: 'glue' },
    durability: { amount: 1, item: 'tape' },
  },
  'improvised-axe': {
    attack: { amount: 1, item: 'pincers' },
    defense: { amount: 2, item: 'knife' },
    durability: { amount: 1, item: 'tape' },
  },
  'wooden-club': {
    attack: { amount: 1, item: 'hacksaw' },
    defense: { amount: 1, item: 'brush' },
    durability: { amount: 1, item: 'tape' },
  },
  'improvised-whip': {
    attack: { amount: 2, item: 'rope' },
    defense: { amount: 1, item: 'knife' },
    durability: { amount: 1, item: 'tape' },
  },
  'fishing-rod': {
    durability: { amount: 1, item: 'rope' },
  },
};

export default {
  weapons,
  weaponPropsUpgrades,
};
