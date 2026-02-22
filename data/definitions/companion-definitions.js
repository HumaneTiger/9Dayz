// @ts-check

/**
 * @typedef {Object} CompanionDefinition
 * @property {string} name
 * @property {number} damage
 * @property {number} protection
 * @property {number} health
 * @property {number} maxHealth
 */

/** @type {Record<string, CompanionDefinition>} */
const companions = {
  doggy: {
    name: 'doggy',
    damage: 4,
    protection: 3,
    health: 6,
    maxHealth: 10,
  },
};

export default {
  companions,
};
