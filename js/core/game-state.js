// @ts-check
/**
 * @import { CharacterDefinition } from '../../data/definitions/character-definitions.js'
 */

import { EventManager, EVENTS } from './index.js';
import { CharacterDefinitions } from '../../data/index.js';
import RngUtils from '../utils/rng-utils.js';

/**
 * @typedef {Object} PlayerProps
 * @property {number} health
 * @property {number} food
 * @property {number} thirst
 * @property {number} energy
 * @property {number} protection
 * @property {number} actions
 */

/**
 * @typedef {Object} Companion
 * @property {boolean} active
 * @property {string|undefined} sort
 * @property {string} name
 * @property {number|undefined} damage
 * @property {number|undefined} health
 * @property {number|undefined} maxHealth
 * @property {number|undefined} protection
 * @property {boolean} dead
 */

/**
 * @typedef {Object} WeaponStats
 * @property {number} [attack]
 * @property {number} [defense]
 * @property {number} [durability]
 */

/**
 * @typedef {Object} TimeConfig
 * @property {number} startHour
 * @property {number} ticksPerHour
 * @property {number} tickInterval
 * @property {number} tickCurrent
 * @property {number} gameTickThreshold
 */

/**
 * @typedef {Object} TimeIsUnity
 * @property {number} gameTick
 * @property {number} gameHours
 * @property {number} gameDays
 * @property {number} todayHours
 * @property {string} todayTime
 */

/**
 * @typedef {Object} Crafting
 * @property {number} total
 */

/**
 * @typedef {Record<string, any>} GameState
 */

/** @type {PlayerProps} */
var playerProps = {
  health: 0,
  food: 0,
  thirst: 0,
  energy: 0,
  protection: 0,
  actions: 0,
};

/** @type {Companion} */
var companion = {
  active: false,
  sort: undefined,
  name: 'doggy',
  damage: undefined,
  health: undefined,
  maxHealth: undefined,
  protection: undefined,
  dead: false,
};

/** @type {Crafting} */
var crafting = {
  total: 0,
};

/** @type {TimeConfig} */
var timeConfig = {
  startHour: 7,
  ticksPerHour: 6,
  tickInterval: 100,
  tickCurrent: 0,
  gameTickThreshold: 4000, // ms before triggering a game tick (lower = faster)
};

/** @type {TimeIsUnity} */
var timeIsUnity = {
  gameTick: 0,
  gameHours: 24 + 7, // 24 + startHour
  gameDays: 1,
  todayHours: 7, // startHour
  todayTime: '07:00',
};

/** @type {GameState} */
var game = {
  gameSeed: RngUtils.generateGameSeed(),
  mode: 'real',
  character: 'everyman',
  isWalking: false,
  isMoveLocked: false,
  startMode: 1,
  startDay: 1,
  timeMode: 'day',
  viewMode: '',
  scaleFactor: 0,
  tutorial: false,
  battle: false,
  tutorialBattle: false,
  gamePaused: true,
  local:
    location.href.startsWith('http://127.0.0.1') || location.href.startsWith('http://localhost'),
  playerPosition: { x: 18, y: 44 },
  mapSize: { width: 49, height: 45 },
  feedingCompanion: false,
  firstUserInteraction: false,
  firstFight: false,
  firstInfestation: false,
  firstLocked: false,
  firstSearch: false,
  firstZedNearby: false,
  firstRatFight: false,
  firstAxeCraft: false,
  firstCorpse: false,
  firstLowEnergy: false,
  firstDeadAnimal: false,
  firstInventoryOpen: false,
  firstCompanion: false,
  testPlayback: false,
  timeConfig,
  timeIsUnity,
};

export default {
  /**
   * @returns {void}
   */
  init: function () {
    EventManager.on(
      EVENTS.GAME_PROP_CHANGED,
      ({ prop, value }) => {
        if (prop === 'timeIsUnity') {
          this.handleTimeChange(value);
        }
      },
      { prop: 'timeIsUnity', value: timeIsUnity }
    );
  },

  /**
   * @param {TimeIsUnity} time
   * @returns {void}
   */
  handleTimeChange: function (time) {
    const hour = time.todayHours;
    const ticksPerHour = timeConfig.ticksPerHour;
    // Only execute on new hour (when gameTick is divisible by ticksPerHour)
    if (time.gameTick % ticksPerHour === 0) {
      if (hour === 21) {
        this.setGameProp('timeMode', 'night');
      }
      if (hour === 5) {
        this.setGameProp('timeMode', 'day');
      }
    }
  },

  /**
   * @returns {CharacterDefinition}
   */
  modifyObjectProperties: function () {
    const character = this.getGameProp('character');
    const charDef = CharacterDefinitions[character];
    // Note: buildingActions modifications require buildingDefinitions destructuring
    // This is handled in Props facade due to shared definition scope
    return charDef;
  },

  /**
   * @returns {Object}
   */
  getGameProps: function () {
    return game;
  },

  /**
   * @param {string} prop
   * @returns {*}
   */
  getGameProp: function (prop) {
    return game[prop];
  },

  /**
   * @param {string} prop
   * @param {*} value
   * @returns {void}
   */
  setGameProp: function (prop, value) {
    game[prop] = value;
    EventManager.emit(EVENTS.GAME_PROP_CHANGED, { prop, value });
  },

  /**
   * @param {Partial<TimeIsUnity>} updates
   * @returns {void}
   */
  updateTimeIsUnity: function (updates) {
    Object.assign(timeIsUnity, updates);
    EventManager.emit(EVENTS.GAME_PROP_CHANGED, { prop: 'timeIsUnity', value: timeIsUnity });
  },

  /**
   * @param {boolean} pause
   * @returns {void}
   */
  pauseGame: function (pause) {
    this.setGameProp('gamePaused', pause);
    if (pause) {
      document.body.classList.add('is--paused');
    } else {
      document.body.classList.remove('is--paused');
    }
  },

  /**
   * @returns {PlayerProps}
   */
  getPlayerProps: function () {
    return playerProps;
  },

  /**
   * @param {keyof PlayerProps} prop
   * @param {number} change
   * @returns {number}
   */
  changePlayerProp: function (prop, change) {
    if (typeof change === 'string') {
      console.error('change must be a number, got string:', change);
      return playerProps[prop];
    }
    const oldValue = playerProps[prop];
    playerProps[prop] += change;
    if (playerProps[prop] < 0) playerProps[prop] = 0;
    if (playerProps[prop] > 100) playerProps[prop] = 100;

    // EVENT: Notify UI that player property changed
    EventManager.emit(EVENTS.PLAYER_PROP_CHANGED, {
      prop,
      change,
      oldValue,
      newValue: playerProps[prop],
    });

    return playerProps[prop];
  },

  /**
   * @returns {Companion}
   */
  getCompanion: function () {
    return companion;
  },

  /**
   * @param {Partial<Companion>} newCompanion
   * @returns {void}
   */
  setCompanion: function (newCompanion) {
    Object.assign(companion, newCompanion); // Updates properties, keeps same reference
  },

  /**
   * @param {Companion} companionData
   * @returns {void}
   */
  addCompanion: function (companionData) {
    this.setCompanion({
      active: true,
      sort: companionData.sort,
      name: companionData.name,
      damage: companionData.damage,
      health: companionData.health,
      maxHealth: companionData.maxHealth,
      protection: companionData.protection,
    });
  },

  /**
   * @returns {Object}
   */
  getCrafting: function () {
    return crafting;
  },
};
