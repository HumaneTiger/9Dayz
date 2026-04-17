// @ts-check

/**
 * @typedef {Object} GameAction
 * @property {string} id
 * @property {string} label
 * @property {number} [time]
 * @property {number} [energy]
 * @property {boolean} [critical]
 * @property {boolean} [locked]
 * @property {boolean} [needsUnlock] - Whether action requires building to be unlocked
 * @property {boolean} [requiresLocked] - Whether action requires building to be locked
 * @property {string[]} [excludeCharacters] - Character types that cannot perform this action
 * @property {string[]} [forCharactersOnly] - If set, only these characters can perform this action
 * @property {string[]} [excludeObjects] - Object names where this action doesn't apply
 * @property {string[]} [includeObjects] - If set, only these objects can be acted upon with this action
 * @export
 */

/**
 * @typedef {Object} ActionProps
 * @property {string} method - Function name to execute (e.g., 'simulateGathering')
 * @property {boolean} oneTime - Whether action completes in one execution
 * @property {number} delay - Delay in milliseconds before action starts
 * @property {string} label - Display label during action execution
 * @property {string} [labelIfLocked] - Display label when action is locked
 * @export
 */

/**
 * @typedef {Object} ActionsDefinition
 * @property {Record<string, ActionProps>} actionProps - Map of action ID to action properties
 * @property {Record<string, GameAction[]>} objectTypeActions - Map of object type to available actions
 * @property {Record<string, GameAction[]>} buildingActions - Map of building type to available actions
 * @export
 */

/** @type {ActionsDefinition} */
export default {
  actionProps: {
    search: {
      method: 'simulateGathering',
      oneTime: true,
      delay: 0,
      label: 'searching',
    },
    cut: {
      method: 'simulateGathering',
      oneTime: true,
      delay: 0,
      label: 'cutting',
      labelIfLocked: 'Knife needed',
    },
    pet: {
      method: 'simulatePetting',
      oneTime: true,
      delay: 1000,
      label: 'petting',
    },
    scare: {
      method: 'simulateScaring',
      oneTime: true,
      delay: 1000,
      label: 'scaring',
    },
    gather: {
      method: 'simulateGathering',
      oneTime: true,
      delay: 0,
      label: 'gathering',
    },
    collect: {
      method: 'simulateCollecting',
      oneTime: true,
      delay: 1000,
      label: 'collecting',
    },
    'scout-area': {
      method: 'simulateScouting',
      oneTime: true,
      delay: 1000,
      label: 'scouting',
    },
    rest: {
      method: 'simulateResting',
      oneTime: false,
      delay: 1000,
      label: 'resting',
    },
    sleep: {
      method: 'simulateSleeping',
      oneTime: false,
      delay: 1000,
      label: 'sleeping',
    },
    cook: {
      method: 'simulateCooking',
      oneTime: false,
      delay: 1000,
      label: 'cooking',
    },
    equip: {
      method: 'simulateEquipping',
      oneTime: true,
      delay: 1000,
      label: 'equipping',
    },
    'cut-down': {
      method: 'simulateCuttingDown',
      oneTime: true,
      delay: 1000,
      label: 'cutting',
      labelIfLocked: 'Axe needed',
    },
    'smash-window': {
      method: 'simulateSmashing',
      oneTime: true,
      delay: 1000,
      label: 'smashing',
      labelIfLocked: 'Axe or Stone needed',
    },
    'break-door': {
      method: 'simulateBreaking',
      oneTime: true,
      delay: 500,
      label: 'breaking',
      labelIfLocked: 'Axe needed',
    },
    'unlock-door': {
      method: 'simulateOpening',
      oneTime: true,
      delay: 1000,
      label: 'opening',
      labelIfLocked: 'Key needed',
    },
    'break-lock': {
      method: 'simulateBreaking',
      oneTime: true,
      delay: 1000,
      label: 'breaking',
      labelIfLocked: 'Axe needed',
    },
    attack: {
      method: 'simulateAttacking',
      oneTime: true,
      delay: 1000,
      label: '',
    },
    lure: {
      method: 'simulateLuring',
      oneTime: true,
      delay: 1000,
      label: 'luring',
    },
    'got-it': {
      method: 'gotIt',
      oneTime: true,
      delay: 0,
      label: '',
    },
    read: {
      method: 'reading',
      oneTime: true,
      delay: 1000,
      label: 'reading',
    },
    drink: {
      method: 'drinking',
      oneTime: false,
      delay: 1000,
      label: 'drinking',
    },
    fish: {
      method: 'fishing',
      oneTime: false,
      delay: 1000,
      label: 'fishing',
      labelIfLocked: 'Fishing rod needed',
    },
    chomp: {
      method: 'chomping',
      oneTime: true,
      delay: 0,
      label: 'Dog attacks',
      labelIfLocked: 'Doggy needed',
    },
    talk: {
      method: 'talking',
      oneTime: false,
      delay: 1000,
      label: 'talking',
    },
    fuel: {
      method: 'exchangingFuel',
      oneTime: false,
      delay: 1000,
      label: 'exchanging fuel',
    },
    'waiting-time': {
      method: 'exchangingFood',
      oneTime: false,
      delay: 1000,
      label: 'exchanging food',
    },
    sail: {
      method: 'sailing',
      oneTime: true,
      delay: 1000,
      label: 'ending demo',
    },
    'plant-tomato': {
      method: 'plantingTomato',
      oneTime: true,
      delay: 1000,
      label: 'planting tomato',
      labelIfLocked: 'Tomato, shovel, branch',
    },
    'plant-pepper': {
      method: 'plantingPepper',
      oneTime: true,
      delay: 1000,
      label: 'planting pepper',
      labelIfLocked: 'Pepper, shovel, branch',
    },
    'plant-pumpkin': {
      method: 'plantingPumpkin',
      oneTime: true,
      delay: 1000,
      label: 'planting pumpkin',
      labelIfLocked: 'Pumpkin, shovel, straw',
    },
    'install-faucet': {
      method: 'installingFaucet',
      oneTime: true,
      delay: 1000,
      label: 'installing faucet',
      labelIfLocked: 'Faucet needed',
    },
    bottle: {
      method: 'simulateGathering',
      oneTime: true,
      delay: 0,
      label: 'bottling water',
    },
    destroy: {
      method: 'destroying',
      oneTime: true,
      delay: 1000,
      label: 'destroying',
      labelIfLocked: 'Axe needed',
    },
  },

  /* === Object type default actions === */
  objectTypeActions: {
    zombie: [
      { id: 'lure', label: 'Lure', time: 20, energy: -15 },
      { id: 'attack', label: 'Attack', time: 5, energy: -20 },
      { id: 'search', label: 'Search', time: 20, energy: -5 },
      { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
    ],
    creature: [
      { id: 'lure', label: 'Lure', time: 20, energy: -15 },
      { id: 'attack', label: 'Attack', time: 5, energy: -20 },
      { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
      { id: 'cut', label: 'Cut', time: 20, energy: -15 },
    ],
    animal: [{ id: 'cut', label: 'Cut', time: 20, energy: -15 }],
    companion: [
      { id: 'pet', label: 'Pet', time: 5, energy: -5 },
      { id: 'scare', label: 'Scare Away', time: 5, energy: -5 },
      { id: 'cut', label: 'Cut', time: 20, energy: -15 },
    ],
    weapon: [
      { id: 'equip', label: 'Equip', excludeObjects: ['barricades'] },
      { id: 'rest', label: 'Rest', time: 60, energy: 20, includeObjects: ['barricades'] },
    ],
    event: [{ id: 'got-it', label: 'Got it!' }],
    npc: [
      { id: 'talk', label: 'Talk', time: 10, energy: 0 },
      { id: 'waiting-time', label: 'Exchange Food', time: 15, energy: 0 },
      { id: 'fuel', label: 'Exchange Fuel', time: 15, energy: 0 },
      { id: 'sail', label: "Let's Sail!", critical: true },
    ],
  },

  buildingActions: {
    house: [
      { id: 'break-door', label: 'break door', time: 5, energy: -10, requiresLocked: true },
      { id: 'unlock-door', label: 'unlock door', time: 5, energy: -5, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -10, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30, energy: -10 },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 30,
        needsUnlock: true,
        excludeCharacters: ['treehugger'],
      },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 10,
        needsUnlock: true,
        forCharactersOnly: ['treehugger'],
      },
      {
        id: 'sleep',
        label: 'sleep',
        time: 120,
        energy: 60,
        needsUnlock: true,
        excludeCharacters: ['treehugger'],
      },
      {
        id: 'sleep',
        label: 'sleep',
        time: 120,
        energy: 30,
        needsUnlock: true,
        forCharactersOnly: ['treehugger'],
      },
    ],
    car: [
      { id: 'unlock-door', label: 'unlock door', time: 5, energy: -5, requiresLocked: true },
      { id: 'smash-window', label: 'smash window', time: 10, energy: -10, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -5, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30, energy: -5 },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 20,
        needsUnlock: true,
        excludeCharacters: ['treehugger'],
      },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 10,
        needsUnlock: true,
        forCharactersOnly: ['treehugger'],
      },
    ],
    farm: [
      { id: 'gather', label: 'gather', time: 15, energy: -10 },
      { id: 'scout-area', label: 'scout area', time: 30 },
    ],
    tree: [
      { id: 'gather', label: 'gather', time: 15, energy: -5 },
      { id: 'scout-area', label: 'scout area', time: 30 },
      { id: 'cut-down', label: 'cut down', time: 25, energy: -25, excludeObjects: ['big-tree'] },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 15,
        excludeCharacters: ['treehugger'],
        excludeObjects: ['small-tree'],
      },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 20,
        forCharactersOnly: ['treehugger'],
        excludeObjects: ['small-tree'],
      },
    ],
    church: [
      { id: 'unlock-door', label: 'unlock door', time: 10, energy: -5, requiresLocked: true },
      { id: 'break-door', label: 'break door', time: 10, energy: -15, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -10, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30, energy: -10 },
      { id: 'rest', label: 'rest', time: 60, energy: 30, needsUnlock: true },
    ],
    signpost: [{ id: 'read', label: 'read', time: 1 }],
    place: [
      { id: 'head-toward', label: 'head toward', time: 0 },
      { id: 'quick-travel', label: 'quick travel', time: 0 },
    ],
    train: [
      { id: 'search', label: 'search', time: 20, energy: -5 },
      { id: 'scout-area', label: 'scout area', time: 30 },
    ],
    shop: [
      { id: 'unlock-door', label: 'unlock door', time: 10, energy: -5, requiresLocked: true },
      { id: 'break-door', label: 'break door', time: 30, energy: -20, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -10, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30, energy: -10 },
    ],
    industrial: [
      { id: 'unlock-door', label: 'unlock door', time: 10, energy: -5, requiresLocked: true },
      { id: 'break-door', label: 'break door', time: 30, energy: -20, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -15, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30, energy: -10 },
    ],
    water: [
      {
        id: 'gather',
        label: 'gather',
        time: 15,
        energy: -5,
        excludeObjects: ['rain-collector', 'water-barrel'],
      },
      {
        id: 'drink',
        label: 'drink',
        time: 10,
        excludeCharacters: ['snackivore'],
      },
      {
        id: 'fish',
        label: 'fish',
        time: 30,
        energy: -5,
        excludeObjects: ['pump', 'well', 'rain-collector', 'water-barrel'],
      },
      {
        id: 'install-faucet',
        label: 'install faucet',
        time: 30,
        energy: -15,
        includeObjects: ['water-barrel'],
      },
      {
        id: 'bottle',
        label: 'bottle water',
        time: 30,
        energy: -15,
        includeObjects: ['rain-collector'],
      },
      {
        id: 'destroy',
        label: 'destroy',
        time: 60,
        energy: -15,
        includeObjects: ['rain-collector', 'water-barrel'],
        critical: true,
      },
    ],
    camping: [
      // break-door, search, scout-area, rest for cabin
      // fireplace excludes: break-door, search, scout-area but adds: cook, sleep
      // seating excludes: break-door, scout-area, sleep
      {
        id: 'break-door',
        label: 'break door',
        time: 10,
        energy: -15,
        excludeObjects: ['fireplace', 'seating', 'outhouse', 'plant-pot'],
        requiresLocked: true,
      },
      {
        id: 'search',
        label: 'search',
        time: 20,
        energy: -10,
        needsUnlock: true,
        excludeObjects: ['fireplace', 'plant-pot'],
      },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 20,
        needsUnlock: true,
        excludeObjects: ['charred-cabine', 'plant-pot'],
      },
      // Fireplace-specific actions
      {
        id: 'cook',
        label: 'cook',
        time: 30,
        excludeCharacters: ['craftsmaniac', 'cashmeister'],
        excludeObjects: ['log-cabine', 'outhouse', 'seating', 'charred-cabine', 'plant-pot'],
      },
      {
        id: 'sleep',
        label: 'sleep',
        time: 120,
        energy: 60,
        forCharactersOnly: ['treehugger'],
        excludeObjects: ['log-cabine', 'outhouse', 'seating', 'charred-cabine', 'plant-pot'],
      },
    ],
    corpse: [{ id: 'search', label: 'search', time: 15, energy: -5, needsUnlock: true }],
    container: [
      { id: 'break-lock', label: 'break lock', time: 30, energy: -20, requiresLocked: true },
      { id: 'search', label: 'search', time: 15, energy: -5, needsUnlock: true },
    ],
    collectable: [
      {
        id: 'collect',
        label: 'collect',
        time: 0,
        excludeObjects: ['tomato-plant', 'pepper-plant', 'pumpkin-plant', 'plant-pot'],
      },
      {
        id: 'gather',
        label: 'gather',
        time: 15,
        energy: -10,
        includeObjects: ['tomato-plant', 'pepper-plant', 'pumpkin-plant'],
      },
      {
        id: 'plant-tomato',
        label: 'plant tomato',
        time: 60,
        energy: -15,
        includeObjects: ['plant-pot'],
      },
      {
        id: 'plant-pepper',
        label: 'plant pepper',
        time: 60,
        energy: -15,
        includeObjects: ['plant-pot'],
      },
      {
        id: 'plant-pumpkin',
        label: 'plant pumpkin',
        time: 60,
        energy: -15,
        includeObjects: ['plant-pot'],
      },
      {
        id: 'destroy',
        label: 'destroy',
        time: 60,
        energy: -15,
        includeObjects: ['plant-pot', 'tomato-plant', 'pepper-plant', 'pumpkin-plant'],
        critical: true,
      },
    ],
  },
};
