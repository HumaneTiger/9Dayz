const subSeeds = Object.freeze({
  fishing: 111,
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

  init(gameSeed) {
    if (!this._fishingRNG) {
      const fishingSeed = gameSeed + subSeeds.fishing;
      this._fishingRNG = new SeededRandom(fishingSeed);
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

  reset(gameSeed) {
    this._fishingRNG = null;
    this.init(gameSeed);
  },
};
