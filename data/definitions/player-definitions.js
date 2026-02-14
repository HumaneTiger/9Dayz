/**
 * @typedef {Object} PlayerProps
 * @property {number} health
 * @property {number} food
 * @property {number} thirst
 * @property {number} energy
 * @property {number} protection
 * @property {number} actions
 */

/**
 * @typedef {Object} Companion
 * @property {boolean} active
 * @property {string|undefined} sort
 * @property {string} name
 * @property {number|undefined} damage
 * @property {number|undefined} health
 * @property {number|undefined} maxHealth
 * @property {number|undefined} protection
 * @property {boolean} dead
 */

export default {
  PlayerProps: {
    health: 0,
    food: 0,
    thirst: 0,
    energy: 0,
    protection: 0,
    actions: 0,
  },
  Companion: {
    active: false,
    sort: undefined,
    name: 'doggy',
    damage: undefined,
    health: undefined,
    maxHealth: undefined,
    protection: undefined,
    dead: false,
  },
};
