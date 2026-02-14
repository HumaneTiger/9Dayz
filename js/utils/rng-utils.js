// @ts-check

/**
 * @typedef {Object} SeededRandomNumber
 * @property {number} seed
 * @property {() => number} random
 * @export
 */

const subSeeds = Object.freeze({
  fishing: 111,
  loot: 222,
  crafting: 333,
  battle: 444,
  cuttingTree: 555,
});

/**
 * SeededRandom class for generating deterministic random numbers
 * @implements {SeededRandomNumber}
 */
class SeededRandom {
  /**
   * @param {number} seed
   */
  constructor(seed) {
    this.seed = seed;
  }

  /**
   * Generate next random number [0, 1)
   * @returns {number}
   */
  random() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

export default {
  /** @type {SeededRandomNumber | null} */
  _fishingRNG: null,
  /** @type {SeededRandomNumber | null} */
  _lootRNG: null,
  /** @type {SeededRandomNumber | null} */
  _craftingRNG: null,
  /** @type {SeededRandomNumber | null} */
  _battleRNG: null,
  /** @type {SeededRandomNumber | null} */
  _cuttingTreeRNG: null,

  /**
   * Initialize all seeded RNG instances with a game seed
   * @param {number} gameSeed
   * @returns {void}
   */
  init(gameSeed) {
    if (!this._fishingRNG) {
      const fishingSeed = gameSeed + subSeeds.fishing;
      this._fishingRNG = new SeededRandom(fishingSeed);
    }
    if (!this._lootRNG) {
      const lootSeed = gameSeed + subSeeds.loot;
      this._lootRNG = new SeededRandom(lootSeed);
    }
    if (!this._craftingRNG) {
      const craftingSeed = gameSeed + subSeeds.crafting;
      this._craftingRNG = new SeededRandom(craftingSeed);
    }
    if (!this._battleRNG) {
      const battleSeed = gameSeed + subSeeds.battle;
      this._battleRNG = new SeededRandom(battleSeed);
    }
    if (!this._cuttingTreeRNG) {
      const cuttingTreeSeed = gameSeed + subSeeds.cuttingTree;
      this._cuttingTreeRNG = new SeededRandom(cuttingTreeSeed);
    }
  },

  /**
   * Generate a random seed for a new game
   * @returns {number}
   */
  generateGameSeed() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    let seed = arr[0];

    // avoid 0 because many LCGs break on 0
    if (seed === 0) seed = 1;

    return seed;
  },

  /**
   * Get fishing RNG instance
   * @returns {SeededRandomNumber}
   */
  get fishingRNG() {
    if (!this._fishingRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._fishingRNG;
  },

  /**
   * Get loot RNG instance
   * @returns {SeededRandomNumber}
   */
  get lootRNG() {
    if (!this._lootRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._lootRNG;
  },

  /**
   * Get crafting RNG instance
   * @returns {SeededRandomNumber}
   */
  get craftingRNG() {
    if (!this._craftingRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._craftingRNG;
  },

  /**
   * Get battle RNG instance
   * @returns {SeededRandomNumber}
   */
  get battleRNG() {
    if (!this._battleRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._battleRNG;
  },

  /**
   * Get cutting tree RNG instance
   * @returns {SeededRandomNumber}
   */
  get cuttingTreeRNG() {
    if (!this._cuttingTreeRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._cuttingTreeRNG;
  },

  /**
   * Reset all RNG instances with a new game seed
   * @param {number} gameSeed
   * @returns {void}
   */
  reset(gameSeed) {
    this._fishingRNG = null;
    this._lootRNG = null;
    this._craftingRNG = null;
    this._battleRNG = null;
    this._cuttingTreeRNG = null;
    this.init(gameSeed);
  },
};
