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
      delay: 1000,
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
};
