import Events, { EVENTS } from './events.js';
import { CharacterDefinitions } from '../data/index.js';
import RngUtils from './utils/rng-utils.js';

var playerProps = {
  health: 0,
  food: 0,
  thirst: 0,
  energy: 0,
  protection: 0,
  actions: 0,
};

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

var crafting = {
  total: 0,
};

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
  timeConfig: {
    startHour: 7,
    ticksPerHour: 6,
    tickInterval: 100,
    tickCurrent: 0,
    gameTickThreshold: 4000, // ms before triggering a game tick (lower = faster)
  },
  timeIsUnity: {
    gameTick: 0,
    gameHours: 24 + 7, // 24 + startHour
    gameDays: 1,
    todayHours: 7, // startHour
    todayTime: '07:00',
  },
};

export default {
  init: function () {
    Events.on(
      EVENTS.GAME_PROP_CHANGED,
      ({ prop, value }) => {
        if (prop === 'timeIsUnity') {
          this.handleTimeChange(value);
        }
      },
      { prop: 'timeIsUnity', value: this.getGameProp('timeIsUnity') }
    );
  },

  handleTimeChange: function (time) {
    const hour = time.todayHours;
    const ticksPerHour = this.getGameProp('timeConfig').ticksPerHour;
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

  modifyObjectProperties: function () {
    const character = this.getGameProp('character');
    const charDef = CharacterDefinitions[character];
    // Note: buildingActions modifications require buildingDefinitions destructuring
    // This is handled in Props facade due to shared definition scope
    return charDef;
  },

  getGameProps: function () {
    return game;
  },

  getGameProp: function (prop) {
    return game[prop];
  },

  setGameProp: function (prop, value) {
    game[prop] = value;
    Events.emit(EVENTS.GAME_PROP_CHANGED, { prop, value });
  },

  updateTimeIsUnity: function (updates) {
    game.timeIsUnity = { ...game.timeIsUnity, ...updates };
    Events.emit(EVENTS.GAME_PROP_CHANGED, { prop: 'timeIsUnity', value: game.timeIsUnity });
  },

  pauseGame: function (pause) {
    this.setGameProp('gamePaused', pause);
    if (pause) {
      document.body.classList.add('is--paused');
    } else {
      document.body.classList.remove('is--paused');
    }
  },

  getPlayerProps: function () {
    return playerProps;
  },

  /**
   * Change a player property (state only)
   * Emits PLAYER_PROP_CHANGED event for UI updates
   */
  changePlayerProp: function (prop, change) {
    const oldValue = playerProps[prop];
    playerProps[prop] += parseInt(change);
    if (playerProps[prop] < 0) playerProps[prop] = 0;
    if (playerProps[prop] > 100) playerProps[prop] = 100;

    // EVENT: Notify UI that player property changed
    Events.emit(EVENTS.PLAYER_PROP_CHANGED, {
      prop,
      change,
      oldValue,
      newValue: playerProps[prop],
    });

    return playerProps[prop];
  },

  getCompanion: function () {
    return companion;
  },

  setCompanion: function (newCompanion) {
    Object.assign(companion, newCompanion); // Updates properties, keeps same reference
  },

  addCompanion: function (companionData) {
    this.setCompanion({
      active: true,
      sort: companionData.sort,
      name: companionData.name,
      damage: companionData.attack,
      health: companionData.health,
      maxHealth: companionData.maxHealth,
      protection: companionData.defense,
    });
  },

  getCrafting: function () {
    return crafting;
  },
};
