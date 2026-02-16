// @ts-check
/**
 * @import { CharacterDefinition } from '../../data/definitions/character-definitions.js'
 */

import { EventManager, EVENTS } from './index.js';
import RngUtils from '../utils/rng-utils.js';

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
   * @returns {Object}
   */
  getCrafting: function () {
    return crafting;
  },
};
