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

/*
const weapons = {
  'improvised-axe': [
    'extra',
    0,
    0,
    0,
    weaponProps['improvised-axe'].attack,
    weaponProps['improvised-axe'].defense,
  ],
  'wooden-club': [
    'extra',
    0,
    0,
    0,
    weaponProps['wooden-club'].attack,
    weaponProps['wooden-club'].defense,
  ],
  wrench: ['extra', 0, 0, 0, weaponProps['wrench'].attack, weaponProps['wrench'].defense],
  'baseball-bat': [
    'extra',
    0,
    0,
    0,
    weaponProps['baseball-bat'].attack,
    weaponProps['baseball-bat'].defense,
  ],
  axe: ['extra', 0, 0, 0, weaponProps['axe'].attack, weaponProps['axe'].defense],
  'improvised-whip': [
    'extra',
    0,
    0,
    0,
    weaponProps['improvised-whip'].attack,
    weaponProps['improvised-whip'].defense,
  ],
  'fishing-rod': [
    'extra',
    0,
    0,
    0,
    weaponProps['fishing-rod'].attack,
    weaponProps['fishing-rod'].defense,
  ],
};
*/

export default {
  weapons,
  weaponPropsUpgrades,
};
