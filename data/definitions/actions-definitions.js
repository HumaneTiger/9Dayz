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
 * @property {string[]} [excludeBuildings] - Building names where this action doesn't apply
 * @property {string[]} [excludeCharacters] - Character types that cannot perform this action
 * @property {string[]} [forCharactersOnly] - If set, only these characters can perform this action
 * @export
 */

/**
 * @typedef {Object} ActionProps
 * @property {string} method - Function name to execute (e.g., 'simulateGathering')
 * @property {boolean} oneTime - Whether action completes in one execution
 * @property {number} delay - Delay in milliseconds before action starts
 * @property {string} label - Display label during action execution
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
    },
    'smash-window': {
      method: 'simulateSmashing',
      oneTime: true,
      delay: 1000,
      label: 'smashing',
    },
    'break-door': {
      method: 'simulateBreaking',
      oneTime: true,
      delay: 500,
      label: 'breaking',
    },
    'unlock-door': {
      method: 'simulateOpening',
      oneTime: true,
      delay: 1000,
      label: 'opening',
    },
    'break-lock': {
      method: 'simulateBreaking',
      oneTime: true,
      delay: 1000,
      label: 'breaking',
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
    },
    chomp: {
      method: 'chomping',
      oneTime: true,
      delay: 0,
      label: 'Dog attacks',
    },
  },

  /* === Object type default actions === */
  objectTypeActions: {
    zombie: [
      { id: 'lure', label: 'Lure', time: 20, energy: -15 },
      { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
      { id: 'search', label: 'Search', time: 20, energy: -5 },
      { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
    ],
    creature: [
      { id: 'lure', label: 'Lure', time: 20, energy: -15 },
      { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
      { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
      { id: 'cut', label: 'Cut', time: 20, energy: -15 },
    ],
    animal: [{ id: 'cut', label: 'Cut', time: 20, energy: -15 }],
    companion: [
      { id: 'pet', label: 'Pet', time: 5, energy: -5 },
      { id: 'scare', label: 'Scare Away', time: 5, energy: -5 },
      { id: 'cut', label: 'Cut', time: 20, energy: -15 },
    ],
    weapon: [{ id: 'equip', label: 'Equip' }],
    event: [{ id: 'got-it', label: 'Got it!' }],
  },

  buildingActions: {
    house: [
      { id: 'break-door', label: 'break door', time: 10, energy: -15, requiresLocked: true },
      { id: 'unlock-door', label: 'unlock door', time: 10, energy: -5, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -10, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30 },
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
      { id: 'unlock-door', label: 'unlock door', time: 10, energy: -5, requiresLocked: true },
      { id: 'smash-window', label: 'smash window', time: 20, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -5, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30 },
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
      { id: 'cut-down', label: 'cut down', time: 25, energy: -25, excludeBuildings: ['big-tree'] },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 15,
        excludeCharacters: ['treehugger'],
        excludeBuildings: ['small-tree'],
      },
      {
        id: 'rest',
        label: 'rest',
        time: 60,
        energy: 20,
        forCharactersOnly: ['treehugger'],
        excludeBuildings: ['small-tree'],
      },
    ],
    church: [
      { id: 'unlock-door', label: 'unlock door', time: 10, energy: -5, requiresLocked: true },
      { id: 'break-door', label: 'break door', time: 10, energy: -15, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -10, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30 },
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
      { id: 'scout-area', label: 'scout area', time: 30 },
    ],
    industrial: [
      { id: 'unlock-door', label: 'unlock door', time: 10, energy: -5, requiresLocked: true },
      { id: 'break-door', label: 'break door', time: 30, energy: -20, requiresLocked: true },
      { id: 'search', label: 'search', time: 20, energy: -15, needsUnlock: true },
      { id: 'scout-area', label: 'scout area', time: 30 },
    ],
    water: [
      { id: 'gather', label: 'gather', time: 15, energy: -5 },
      {
        id: 'drink',
        label: 'drink',
        time: 10,
        excludeCharacters: ['snackivore'],
      },
      { id: 'fish', label: 'fish', time: 30, energy: -5, excludeBuildings: ['pump', 'well'] },
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
        excludeBuildings: ['fireplace', 'seating', 'outhouse'],
        requiresLocked: true,
      },
      {
        id: 'search',
        label: 'search',
        time: 20,
        energy: -10,
        needsUnlock: true,
        excludeBuildings: ['fireplace'],
      },
      { id: 'rest', label: 'rest', time: 60, energy: 20, needsUnlock: true },
      // Fireplace-specific actions
      {
        id: 'cook',
        label: 'cook',
        time: 30,
        excludeCharacters: ['craftsmaniac', 'cashmeister'],
        excludeBuildings: ['log-cabine', 'outhouse', 'seating', 'barricades'],
      },
      {
        id: 'sleep',
        label: 'sleep',
        time: 120,
        energy: 60,
        forCharactersOnly: ['treehugger'],
        excludeBuildings: ['log-cabine', 'outhouse', 'seating', 'barricades'],
      },
    ],
    corpse: [{ id: 'search', label: 'search', time: 15, energy: -5, needsUnlock: true }],
    container: [
      { id: 'break-lock', label: 'break lock', time: 30, energy: -20, requiresLocked: true },
      { id: 'search', label: 'search', time: 15, energy: -5, needsUnlock: true },
    ],
    collectable: [{ id: 'collect', label: 'collect', time: 0 }],
  },
};
