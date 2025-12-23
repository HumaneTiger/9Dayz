export default {
  everyman: {
    inventoryPreset: {
      tomato: 2,
      'drink-2': 1,
      'snack-1': 1,
      knife: 1,
      'energy-pills': 1,
      pepper: 1,
    },
  },

  treehugger: {
    inventoryPreset: {
      'mushroom-1': 2,
      acorn: 1,
      branch: 1,
      'fruit-2': 2,
      knife: 1,
    },
    buildingActionModifiers: {
      tree: { 3: 'rest|60|+20' },
      house: { 3: 'rest|60|+10', 4: 'sleep|120|+30' },
      car: { 3: 'rest|60|+10' },
    },
  },

  snackivore: {
    inventoryPreset: {
      'snack-1': 3,
      'drink-5': 1,
      'snack-2': 1,
    },
  },

  craftsmaniac: {
    inventoryPreset: {
      spanner: 1,
      tape: 1,
      knife: 1,
      'drink-2': 1,
      pincers: 1,
      nails: 1,
    },
  },

  furbuddy: {
    inventoryPreset: {},
  },

  hardcharger: {
    inventoryPreset: {},
  },

  cashmeister: {
    inventoryPreset: {},
  },
};
