// @ts-check

/**
 * @typedef {Object} BuildingProp
 * @property {number} locked - Higher means more likely to be locked (11 means always locked, 0 means never locked)
 * @property {number} spawn
 * @property {string[]} items
 * @property {number} [amount]
 * @property {boolean} [preview]
 * @property {string[]} [buildings]
 * @export
 */

/**
 * @typedef {Object} BuildingDefinition
 * @property {Record<string, string[]>} buildingTypes
 * @property {Record<string, BuildingProp>} buildingProps
 * @export
 */

/** @type {BuildingDefinition} */
export default {
  buildingTypes: {
    house: ['house', 'barn', 'cottage', 'old-villa', 'farm-house', 'town-house', 'basement'],
    car: ['car-1', 'car-2'],
    farm: ['field', 'compost', 'scarecrow', 'beehive'],
    tree: ['small-tree', 'big-tree'],
    church: ['church'],
    signpost: [
      'signpost-1',
      'signpost-2',
      'signpost-3',
      'signpost-4',
      'signpost-5',
      'signpost-6',
      'signpost-7',
    ],
    place: ['milton', 'sobor'],
    train: ['train-wreck-2', 'train-wreck-1'],
    shop: ['market', 'gas-station'],
    industrial: ['tool-shed', 'garage'],
    water: ['well', 'jetty', 'pump'],
    container: ['crate'],
    collectable: ['key'],
    camping: ['seating', 'log-cabine', 'outhouse', 'fireplace', 'barricades'],
    corpse: ['human-corpse-1'],
  },

  buildingProps: {
    barn: { locked: 1.2, spawn: 2, items: ['claw', 'straw-wheet', 'pumpkin', 'nails'] },
    'big-tree': {
      locked: 0,
      spawn: 3,
      items: ['acorn', 'branch', 'fruit-1', 'fruit-2', 'fruit-3', 'mushroom-1', 'stone'],
      amount: 2,
    },
    outhouse: {
      locked: 0,
      spawn: 1,
      items: ['exodus', 'acorn', 'hawthorn', 'rosehip', 'straw-wheet'],
    },
    pump: { locked: 0, spawn: 1, items: ['branch', 'physalis', 'reef', 'spanner'] },
    house: {
      locked: 2,
      spawn: 3,
      items: [
        'fruit-bread',
        'wine',
        'snack-1',
        'snack-2',
        'energy-pills',
        'knife',
        'tape',
        'drink-2',
        'drink-5',
        'exodus',
        'cloth',
      ],
    },
    basement: {
      locked: 0,
      spawn: 3,
      items: ['wine', 'tape', 'cloth', 'hacksaw', 'bones', 'spanner', 'books', 'nails', 'flour'],
    },
    'farm-house': {
      locked: 2,
      spawn: 3,
      items: [
        'bread-2',
        'wine',
        'pumpkin',
        'carrot',
        'knife',
        'pepper',
        'tomato',
        'exodus',
        'nails',
        'flour',
      ],
    },
    'town-house': {
      locked: 3,
      spawn: 3,
      items: [
        'bread-2',
        'wine',
        'snack-1',
        'snack-2',
        'energy-pills',
        'knife',
        'tape',
        'drink-2',
        'drink-5',
        'exodus',
        'cloth',
      ],
    },
    'car-1': {
      locked: 2,
      spawn: 2,
      items: [
        'snack-1',
        'snack-2',
        'energy-pills',
        'drink-3',
        'drink-4',
        'tape',
        'spanner',
        'cloth',
      ],
    },
    'signpost-1': { locked: 0, spawn: 0, items: [] },
    'signpost-2': { locked: 0, spawn: 0, items: [] },
    'signpost-3': { locked: 0, spawn: 0, items: [] },
    'signpost-4': { locked: 0, spawn: 0, items: [] },
    'signpost-5': { locked: 0, spawn: 0, items: [] },
    'signpost-6': { locked: 0, spawn: 0, items: [] },
    'signpost-7': { locked: 0, spawn: 0, items: [] },
    'old-villa': {
      locked: 3,
      spawn: 3,
      items: ['bread-2', 'wine', 'knife', 'rope', 'exodus', 'books'],
    },
    'car-2': {
      locked: 2,
      spawn: 2,
      items: ['snack-1', 'snack-2', 'energy-pills', 'drink-3', 'drink-4', 'tape', 'spanner'],
    },
    field: {
      locked: 0,
      spawn: 3,
      items: ['carrot', 'pepper', 'pumpkin', 'mushroom-2', 'straw-wheet', 'tomato'],
      buildings: ['scarecrow'],
      amount: 2,
    },
    compost: {
      locked: 0,
      spawn: 1,
      items: ['carrot', 'pepper', 'pumpkin', 'mushroom-2', 'tomato'],
      amount: 2,
    },
    scarecrow: {
      locked: 0,
      spawn: 1,
      items: ['straw-wheet', 'straw-wheet', 'pumpkin', 'cloth'],
      amount: 2,
    },
    beehive: { locked: 0, spawn: 1, items: ['honey'], amount: 5 },
    'small-tree': {
      locked: 0,
      spawn: 2,
      items: ['branch', 'hawthorn', 'physalis', 'rosehip', 'mushroom-1', 'stone', 'straw-wheet'],
    },
    church: { locked: 2, spawn: 3, items: ['books', 'wine', 'bread-2'] },
    milton: { locked: 0, spawn: 0, items: [] },
    sobor: { locked: 0, spawn: 0, items: [] },
    'train-wreck-2': { locked: 0, spawn: 2, items: ['energy-pills', 'pincers', 'spanner'] },
    'train-wreck-1': {
      locked: 0,
      spawn: 3,
      items: ['snack-1', 'snack-2', 'drink-2', 'drink-5', 'wine'],
    },
    market: {
      locked: 2,
      spawn: 3,
      items: [
        'fruit-bread',
        'bread-2',
        'wine',
        'snack-1',
        'snack-2',
        'energy-pills',
        'knife',
        'tape',
        'drink-3',
        'drink-4',
        'exodus',
      ],
    },
    'gas-station': {
      locked: 2,
      spawn: 3,
      items: [
        'fruit-bread',
        'bread-2',
        'wine',
        'snack-1',
        'snack-2',
        'energy-pills',
        'knife',
        'tape',
        'drink-2',
        'drink-1',
        'exodus',
      ],
    },
    'tool-shed': {
      locked: 2,
      spawn: 2,
      items: ['cloth', 'rope', 'fail', 'hacksaw', 'knife', 'mallet', 'pincers', 'tape'],
    },
    garage: {
      locked: 3,
      spawn: 3,
      items: ['cloth', 'rope', 'fail', 'hacksaw', 'knife', 'mallet', 'pincers', 'tape', 'nails'],
    },
    well: {
      locked: 0,
      spawn: 1,
      items: ['rosehip', 'bones', 'mushroom-1', 'stone'],
      amount: 2,
    },
    jetty: {
      locked: 0,
      spawn: 1,
      items: ['reef', 'rosehip', 'stone', 'branch'],
      amount: 2,
    },
    seating: { locked: 0, spawn: 1, items: ['drink-1', 'drink-2', 'snack-1', 'snack-2'] },
    'log-cabine': {
      locked: 1.4,
      spawn: 2,
      items: [
        'stump',
        'straw-wheet',
        'branch',
        'cloth',
        'drink-3',
        'drink-4',
        'snack-1',
        'snack-2',
      ],
    },
    cottage: {
      locked: 2,
      spawn: 3,
      items: ['bread-2', 'wine', 'snack-1', 'snack-2', 'knife', 'drink-2', 'drink-5', 'exodus'],
    },
    fireplace: { locked: 0, spawn: 0, items: [] },
    barricades: { locked: 0, spawn: 0, items: [], preview: true },
    crate: { locked: 11, spawn: 1, items: ['axe', 'wrench', 'baseball-bat'] }, // always locked
    'human-corpse-1': {
      locked: 0,
      spawn: 3,
      items: [
        'wine',
        'snack-1',
        'bread-2',
        'energy-pills',
        'snack-2',
        'knife',
        'drink-2',
        'drink-5',
        'exodus',
        'cloth',
        'rope',
        'wooden-club',
      ],
    },
    key: { locked: 0, spawn: 0, items: [] },
  },
};
