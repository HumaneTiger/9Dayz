// @ts-check
/**
 * @typedef {Array<Card>} CardDeck
 * @typedef {Array<BattleCard>} BattleDeck
 * @typedef {Array<number>} OpponentDeck
 */

/**
 * @typedef {Object} Card
 * @property {number} id
 * @property {number} distance
 */

/**
 * @typedef {Object} BattleCard
 * @property {number} id
 * @property {string} name
 * @property {number} damage
 * @property {number} modifyDamage
 * @property {number} protection
 */

export default {
  /** @type {CardDeck} */
  cardDeck: [],
  /** @type {BattleDeck} */
  battleDeck: [],
  /** @type {OpponentDeck} */
  opponentDeck: [],
};
