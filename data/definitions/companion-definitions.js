// @ts-check

/**
 * @typedef {Object} CompanionDefinition
 * @property {string} name
 * @property {number} attack
 * @property {number} defense
 * @property {number} health
 * @property {number} maxHealth
 */

/** @type {Record<string, CompanionDefinition>} */
const companions = {
  doggy: {
    name: 'doggy',
    attack: 4,
    defense: 3,
    health: 6,
    maxHealth: 10,
  },
};

export default {
  companions,
};
