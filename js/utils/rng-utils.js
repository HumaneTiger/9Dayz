const subSeeds = Object.freeze({
  fishing: 111,
  loot: 222,
  crafting: 333,
  battle: 444,
  cuttingTree: 555,
});

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  random() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

export default {
  _fishingRNG: null,
  _lootRNG: null,
  _craftingRNG: null,
  _battleRNG: null,
  _cuttingTreeRNG: null,

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

  generateGameSeed() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    let seed = arr[0];

    // avoid 0 because many LCGs break on 0
    if (seed === 0) seed = 1;

    return seed;
  },

  get fishingRNG() {
    if (!this._fishingRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._fishingRNG;
  },

  get lootRNG() {
    if (!this._lootRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._lootRNG;
  },

  get craftingRNG() {
    if (!this._craftingRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._craftingRNG;
  },

  get battleRNG() {
    if (!this._battleRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._battleRNG;
  },

  get cuttingTreeRNG() {
    if (!this._cuttingTreeRNG) throw new Error('RngUtil not initialized with gameSeed');
    return this._cuttingTreeRNG;
  },

  reset(gameSeed) {
    this._fishingRNG = null;
    this._lootRNG = null;
    this._craftingRNG = null;
    this._battleRNG = null;
    this._cuttingTreeRNG = null;
    this.init(gameSeed);
  },
};
