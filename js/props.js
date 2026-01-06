import Events, { EVENTS } from './events.js';
import buildingData from '../data/map/building-instances.js';
import zombieData from '../data/map/zombie-instances.js';
import pathData from '../data/map/path-instances.js';
import buildingDefinitions from '../data/definitions/building-definitions.js';
import characterDefinitions from '../data/definitions/character-definitions.js';
import itemsWeaponsDefinitions from '../data/definitions/items-weapons-definitions.js';
import BuildingUtils from '../data/utils/building-utils.js';
import LootUtils from '../data/utils/loot-utils.js';
import ItemUtils from '../data/utils/item-utils.js';
import PathUtils from '../data/utils/path-utils.js';
import RngUtils from './utils/rng-utils.js';

const mapSize = { width: 49, height: 45 };

// Destructure building definitions for use throughout the file
const { buildingProps, buildingActions } = buildingDefinitions;

// Destructure items/weapons definitions
const { items, weaponProps, weaponPropsUpgrades } = itemsWeaponsDefinitions;

var inventory = {
  items: new Array(),
  itemNumbers: 0,
  leftHand: null,
  rightHand: null,
};

var inventoryBatch = {
  active: false,
  oldTotal: 0,
};

var crafting = {
  total: 0,
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

var playerProps = {
  health: 0,
  food: 0,
  thirst: 0,
  energy: 0,
  protection: 0,
  actions: 0,
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
  local: location.href.startsWith('http://127.0.0.1'),
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

// create 2D array with map size for object ids at positions
var objectIdsAt = Array.from({ length: mapSize.width }, () => new Array(mapSize.height));

var objects = [];
var objectsIdCounter = 0;
var zedCounter = 1;

// create 2D array with map size for paths
var paths = Array.from({ length: mapSize.width }, () => new Array(mapSize.height));

let targetLocations = {
  'Lakeside Camp Resort': [5, 37],
  Rocksprings: [22, 34],
  'Haling Cove': [16, 8],
  Litchfield: [15, 23],
  Greenleafton: [33, 35],
  'Billibalds Farm': [40, 30],
  'Camp Silverlake': [28, 22],
  'Harbor Gas Station': [34, 16],
};

export default {
  init: function () {
    this.setupAllPaths();
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
    const charDef = characterDefinitions[character];

    if (charDef?.buildingActionModifiers) {
      for (const buildingType in charDef.buildingActionModifiers) {
        const modifiers = charDef.buildingActionModifiers[buildingType];
        for (const actionIndex in modifiers) {
          buildingActions[buildingType][actionIndex] = modifiers[actionIndex];
        }
      }
    }
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

  /* inventory */
  getAllItems: function () {
    return items;
  },

  getItem: function (item) {
    return items[item];
  },

  getCompanion: function () {
    return companion;
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

  /* active crafting number */
  getCrafting: function () {
    return crafting;
  },

  getObjectIdsAt: function (x, y) {
    if (objectIdsAt[x]) {
      return objectIdsAt[x][y];
    }
  },

  getObjectsAt: function (x, y) {
    let allObjectsAt = [];
    this.getObjectIdsAt(x, y)?.forEach(id => {
      allObjectsAt.push(this.getObject(id));
    });
    return allObjectsAt;
  },

  addObjectIdAt: function (x, y) {
    const id = objectsIdCounter;
    if (!objectIdsAt[x]) {
      objectIdsAt[x] = [];
    }
    if (!objectIdsAt[x][y]) {
      objectIdsAt[x][y] = [];
    }
    objectIdsAt[x][y].push(id);
    objectsIdCounter += 1;
    return id;
  },

  getObject: function (id) {
    return objects[id];
  },

  setObject: function (id, data) {
    objects[id] = data;
  },

  getAllObjects: function () {
    return objects;
  },

  setAllObjects: function (newObjects) {
    objects = newObjects;
  },

  getAllObjectIdsAt: function () {
    return objectIdsAt;
  },

  setAllObjectIdsAt: function (newObjectIdsAt) {
    objectIdsAt = newObjectIdsAt;
  },

  getObjectsIdCounter: function () {
    return objectsIdCounter;
  },

  setObjectsIdCounter: function (value) {
    objectsIdCounter = value;
  },

  getZedCounter: function () {
    return zedCounter;
  },

  setZedCounter: function (value) {
    zedCounter = value;
  },

  getAllPaths: function () {
    return paths;
  },

  getAllTargetLocations: function () {
    return targetLocations;
  },

  getInventory: function () {
    return inventory;
  },

  getInventoryItemNumbers: function () {
    return inventory.itemNumbers;
  },

  getInventoryPresets: function (character) {
    return characterDefinitions[character]?.inventoryPreset || {};
  },

  createGameObject: function (overrides = {}) {
    return {
      x: undefined,
      y: undefined,
      name: undefined,
      title: '',
      type: undefined,
      group: undefined,
      text: false,
      actions: [],
      items: [],
      locked: undefined,
      hasKey: false,
      looted: false,
      infested: false,
      zednearby: null,
      active: true,
      inreach: false,
      discovered: false,
      distance: null,
      preview: undefined,
      attack: undefined,
      defense: undefined,
      dead: undefined,
      luringSuccessful: undefined,
      fighting: false,
      health: undefined,
      maxHealth: undefined,
      disabled: false,
      removed: false,
      ...overrides,
    };
  },

  /**
   * Begin batching inventory changes
   * Captures current total, multiple adds will emit single event
   */
  beginInventoryBatch: function () {
    inventoryBatch.active = true;
    inventoryBatch.oldTotal = inventory.itemNumbers;
  },

  /**
   * End batching and emit single INVENTORY_CHANGED event
   */
  endInventoryBatch: function () {
    inventoryBatch.active = false;
    const newTotal = inventory.itemNumbers;

    // EVENT: Notify that inventory changed
    Events.emit(EVENTS.INVENTORY_CHANGED, {
      oldTotal: inventoryBatch.oldTotal,
      newTotal: newTotal,
    });
  },

  addWeaponToInventory: function (item, addAmount, setWeaponProps) {
    const amount = parseInt(addAmount),
      setDamage = setWeaponProps.damage,
      setProtection = setWeaponProps.protection,
      setDurability = setWeaponProps.durability,
      itemProps = items[item];

    const oldTotal = this.getWeaponTotal();

    if (inventory.items[item] !== undefined) {
      // weapon was added to inventory before
      inventory.items[item].amount += amount;
      inventory.items[item].amount < 0 ? (inventory.items[item].amount = 0) : false;

      setDamage ? (inventory.items[item].damage = setDamage) : false;
      setProtection ? (inventory.items[item].protection = setProtection) : false;

      if (setDurability !== undefined) {
        inventory.items[item].durability += setDurability;
        if (inventory.items[item].durability <= 0) {
          // remove and reset inventory weapon props
          inventory.items[item].amount = 0;
          inventory.items[item].damage = ItemUtils.calcItemDamage(item);
          inventory.items[item].protection = ItemUtils.calcItemProtection(item);
          inventory.items[item].durability = 0;
        }
      }
    } else if (itemProps !== undefined) {
      // weapon is added first time to inventory
      inventory.items[item] = {
        type: itemProps[0],
        name: item,
        amount: amount,
        damage: setDamage || ItemUtils.calcItemDamage(item),
        protection: setProtection || ItemUtils.calcItemProtection(item),
        durability: setDurability,
      };
    } else {
      console.log('adding weapon "' + item + '" to inventory failed');
    }

    const newTotal = this.getWeaponTotal();

    // EVENT: Emit if not batching
    if (!inventoryBatch.active) {
      Events.emit(EVENTS.WEAPON_CHANGED, {
        oldTotal: oldTotal,
        newTotal: newTotal,
      });
    }
  },

  getWeaponTotal: function () {
    let total = 0;
    for (let item in inventory.items) {
      if (inventory.items[item].type === 'extra' && inventory.items[item].amount > 0) {
        total += 1;
      }
    }
    return total;
  },

  addCompanion: function (objectId) {
    const object = this.getObject(objectId);
    companion.active = true;
    companion.sort = object.sort;
    companion.name = object.name;
    companion.damage = object.attack;
    companion.health = object.health;
    companion.maxHealth = object.maxHealth;
    companion.protection = object.defense;
  },

  addItemToInventory: function (item, addAmount) {
    const amount = parseInt(addAmount),
      itemProps = items[item];

    const oldTotal = inventory.itemNumbers;

    if (inventory.items[item] !== undefined) {
      // item was added to inventory before
      inventory.items[item].amount += amount;
      inventory.items[item].amount < 0 ? (inventory.items[item].amount = 0) : false;
    } else if (itemProps !== undefined) {
      // item is added first time to inventory
      inventory.items[item] = {
        type: itemProps[0],
        name: item,
        amount: amount,
        damage: ItemUtils.calcItemDamage(item), // props for battle mode
        protection: ItemUtils.calcItemProtection(item), // props for battle mode
      };
    } else {
      console.log('adding item "' + item + '" to inventory failed');
    }
    this.calcTotalInventoryItems();

    // EVENT: Emit if not batching
    if (!inventoryBatch.active) {
      Events.emit(EVENTS.INVENTORY_CHANGED, {
        oldTotal: oldTotal,
        newTotal: inventory.itemNumbers,
      });
    }
  },

  calcTotalInventoryItems: function () {
    inventory.itemNumbers = 0;
    for (let item in inventory.items) {
      if (
        inventory.items[item].type !== 'extra' &&
        inventory.items[item].amount &&
        inventory.items[item].amount > 0
      ) {
        inventory.itemNumbers += inventory.items[item].amount;
      }
    }
  },

  calcItemProps: function (item) {
    return ItemUtils.calcItemProps(item, this.getGameProp('character'));
  },

  setupAllBuildings: function () {
    // ONLY FOR TUTORIAL (hardcoded - special case)
    if (this.getGameProp('tutorial')) {
      this.setupBuilding(
        18,
        44,
        ['crate'],
        false,
        LootUtils.forceLootItemList(['drink-5', 'bread-1', 'wooden-club'])
      );
      this.setupWeapon(18, 44, 'axe', {
        attack: this.getWeaponProps('axe').attack / 2,
        defense: this.getWeaponProps('axe').defense / 2,
        durability: this.getWeaponProps('axe').durability / 2,
      });
      this.setZedAt(18, 42, 1, 3, 2); // weak zed for tutorial
    }

    // Setup all regular buildings from imported JSON
    buildingData.buildings.forEach(entry => {
      this.setupBuilding(entry.x, entry.y, entry.buildings, entry.infested);
    });
  },

  setupAllZeds: function () {
    // Setup all zombies from imported JSON
    zombieData.zombies.forEach(entry => {
      this.setZedAt(entry.x, entry.y, entry.amount);
    });
  },

  createCreaturesList: function (creatureType, x, y) {
    let creaturesList = [];
    switch (creatureType) {
      case 'rat':
        {
          const amount = Math.round(Math.random() * 5) || 3;
          for (let i = 0; i < amount; i++) {
            const lootItemList = LootUtils.createLootItemList(2, ['meat', 'bones'], [11, 6], 2);
            creaturesList.push({
              x: x,
              y: y,
              name: 'rat',
              type: 'rat',
              items: lootItemList,
              attack: Math.floor(Math.random() * 3 + 1),
              defense: Math.floor(Math.random() * 4 + 2),
              dead: false,
            });
          }
        }
        break;
      case 'bee':
        {
          const amount = Math.round(Math.random() * 2) + 4;
          for (let i = 0; i < amount; i++) {
            const lootItemList = LootUtils.createLootItemList(1, ['meat'], [7, 5], 1);
            creaturesList.push({
              x: x,
              y: y,
              name: 'bee',
              type: 'bee',
              items: lootItemList,
              attack: Math.floor(Math.random() * 3 + 1),
              defense: Math.floor(Math.random() * 4 + 2),
              dead: false,
            });
          }
        }
        break;
    }
    return creaturesList;
  },

  createAdditionalGameObjects: function (buildingType, buildingName, x, y) {
    let additionalGameObjects = [];
    if (buildingType === 'house' && Math.random() < 0.25) {
      additionalGameObjects.push({
        x: x,
        y: y,
        name: 'human-corpse-1',
        group: 'building',
        forceInfested: false,
        forceLootItemList: this.createBuildingLootItemList('human-corpse-1'),
      });
    }

    if ((buildingName === 'house' || buildingName === 'farm-house') && Math.random() < 0.2) {
      additionalGameObjects.push({
        x: x,
        y: y,
        name: 'basement',
        group: 'building',
        forceInfested: true,
        forceLootItemList: this.createBuildingLootItemList('basement'),
        forceCreaturesList: this.createCreaturesList('rat', x, y),
      });
    }

    /* old villas have a guaranteed basement with crate */
    if (buildingName === 'old-villa') {
      additionalGameObjects.push({
        x: x,
        y: y,
        name: 'basement',
        group: 'building',
        forceInfested: true,
        forceCreaturesList: this.createCreaturesList('rat', x, y),
        forceAdditionalGameObjects: [
          {
            x: x,
            y: y,
            name: 'crate',
            group: 'building',
            forceInfested: false,
            forceLootItemList: this.createBuildingLootItemList('crate'),
          },
        ],
      });
    }

    if (buildingName === 'well' || buildingName === 'jetty') {
      if (Math.random() < 0.15) {
        additionalGameObjects.push({
          x: x,
          y: y,
          name: 'froggy',
          group: 'animal',
          items: LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 6], 3),
          dead: true,
        });
      } else if (Math.random() < 0.2) {
        // 0.15 probability for second branch
        additionalGameObjects.push({
          x: x,
          y: y,
          name: 'duck',
          group: 'animal',
          items: LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 6], 3),
          dead: true,
        });
      }
    }

    if (buildingName === 'barn' || buildingName === 'field') {
      if (Math.random() < 0.1) {
        additionalGameObjects.push({
          x: x,
          y: y,
          name: 'duck',
          group: 'animal',
          items: LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 6], 3),
          dead: true,
        });
      }
    }

    return additionalGameObjects;
  },

  createBuildingLootItemList: function (buildingName, forceLootItemList = false) {
    const props = buildingProps[buildingName];
    return (
      forceLootItemList ||
      LootUtils.createLootItemList(
        props.spawn,
        JSON.parse(JSON.stringify(props.items)),
        BuildingUtils.getLootBuildingProbability(buildingName, this.getGameProp('character')),
        props.amount,
        () => RngUtils.lootRNG.random()
      )
    );
  },

  setupBuilding: function (
    x,
    y,
    buildingNamesArray,
    forceInfested = false,
    forceLootItemList = false,
    forceCreaturesList = false,
    forceAdditionalGameObjects = false
  ) {
    buildingNamesArray.forEach(buildingName => {
      const props = buildingProps[buildingName];
      const type = BuildingUtils.getBuildingTypeOf(buildingName);
      // Generate loot upfront
      const lootItemList = this.createBuildingLootItemList(buildingName, forceLootItemList);

      // Random locked state
      const locked = Math.random() * props.locked > 1 ? true : false;

      // Pre-generate random key if the building is locked
      let hasKey = false;
      if (locked) {
        if (Math.random() >= 0.5) hasKey = true; // 50% chance to have key
      }

      // Random infested state
      const infested = type === 'house' && Math.random() < 0.5 ? true : false;

      // Pre-generate creatures if the building is infested
      let creaturesList = [];
      if (forceInfested || infested) {
        if (buildingName === 'beehive') {
          creaturesList = forceCreaturesList || this.createCreaturesList('bee', x, y);
        } else {
          creaturesList = forceCreaturesList || this.createCreaturesList('rat', x, y);
        }
      }

      // for certain buildings, add additional buildings which spawn when the building is searched
      let additionalGameObjects = [];
      additionalGameObjects =
        forceAdditionalGameObjects || this.createAdditionalGameObjects(type, buildingName, x, y);

      // Assign a stable object ID
      const currentObjectsIdCounter = this.addObjectIdAt(x, y);

      // Create building object with everything persisted
      this.setObject(
        currentObjectsIdCounter,
        this.createGameObject({
          x: x,
          y: y,
          name: buildingName,
          title: buildingName.startsWith('signpost-')
            ? 'signpost'
            : buildingName.replace('-1', '').replace('-2', '').replace('-', ' '),
          type: type,
          group: 'building',
          actions: props.preview
            ? [{ id: 'got-it', label: 'Got it!' }]
            : BuildingUtils.getBuildingActionsFor(
                buildingName,
                locked,
                forceInfested || infested,
                this.getGameProp('character')
              ),
          items: lootItemList,
          locked: locked,
          hasKey: hasKey,
          infested: forceInfested || infested,
          enemies: creaturesList,
          preview: props.preview,
          additionalGameObjects: additionalGameObjects,
        })
      );
    });
  },

  setZedAt: function (x, y, amount, forceAttack = false, forceDefense = false) {
    for (let i = 0; i < amount; i += 1) {
      const distance = Math.sqrt(
        Math.pow(this.getGameProp('playerPosition').x - x, 2) +
          Math.pow(this.getGameProp('playerPosition').y - y, 2)
      );

      const attack = forceAttack || Math.floor(Math.random() * 6 + Math.min(distance / 5, 9) + 1); // increase attack with distance
      const defense = forceDefense || Math.floor(Math.random() * 9 + Math.min(distance / 4, 9)); // increase defense with distance
      const lootItemList = LootUtils.createLootItemList(
        3,
        [
          'fail',
          'hacksaw',
          'knife',
          'mallet',
          'pincers',
          'spanner',
          'tape',
          'snack-1',
          'drink-1',
          'nails',
        ],
        [10, attack >= 10 ? 9 : 5]
      );
      const name = 'zombie-' + zedCounter;

      zedCounter = (zedCounter % 3) + 1; // Cycle through 1, 2, 3

      const currentObjectsIdCounter = this.addObjectIdAt(x, y);
      this.setObject(
        currentObjectsIdCounter,
        this.createGameObject({
          x: x,
          y: y,
          name: name,
          group: 'zombie',
          actions: [
            { id: 'lure', label: 'Lure', time: 20, energy: -15 },
            { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
            { id: 'search', label: 'Search', time: 20, energy: -5 },
            { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
          ],
          items: lootItemList,
          attack: attack,
          defense: defense,
          luringSuccessful: Math.random() >= 0.4, // 60:40 chance it works
          dead: false,
        })
      );
    }
  },

  setEventAt: function (x, y, title, text) {
    const currentObjectsIdCounter = this.addObjectIdAt(x, y);
    this.setObject(currentObjectsIdCounter, {
      x: x,
      y: y,
      name: 'event',
      title: title,
      type: undefined,
      group: 'event',
      text: text,
      actions: [
        {
          id: 'got-it',
          label: 'Got it!',
        },
      ],
      items: [],
      discovered: false,
      removed: false,
    });

    return currentObjectsIdCounter;
  },

  spawnCreaturesAt: function (x, y, creaturesList) {
    let spawnedCreatureIds = [];
    creaturesList.forEach(creature => {
      const currentObjectsIdCounter = this.addObjectIdAt(x, y);
      this.setObject(
        currentObjectsIdCounter,
        this.createGameObject({
          x: creature.x,
          y: creature.y,
          name: creature.name,
          type: creature.type,
          group: 'zombie',
          actions: [
            { id: 'lure', label: 'Lure', time: 20, energy: -15 },
            { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
            { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
            { id: 'cut', label: 'Cut', time: 20, energy: -15 },
          ],
          items: creature.items,
          attack: creature.attack,
          defense: creature.defense,
          luringSuccessful: Math.random() >= 0.4, // 60:40 chance it works
          dead: creature.dead,
        })
      );
      spawnedCreatureIds.push(currentObjectsIdCounter);
    });
    return spawnedCreatureIds;
  },

  rngFishSpawn: function (x, y) {
    /**
     * 3/4 chance to catch a fish
     * Deterministic RNG based on game seed
     * Allows for consistent fish spawns for test playbacks
     */
    if (RngUtils.fishingRNG.random() < 0.75) {
      this.spawnAnimal({
        x: x,
        y: y,
        name: 'fish',
        group: 'animal',
        items: LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 6], 3, () =>
          RngUtils.fishingRNG.random()
        ), // pass the same RNG for deterministic loot
        dead: true,
      });
      return true;
    }
    return false;
  },

  spawnAnimal: function (object) {
    const currentObjectsIdCounter = this.addObjectIdAt(object.x, object.y);
    this.setObject(
      currentObjectsIdCounter,
      this.createGameObject({
        x: object.x,
        y: object.y,
        name: object.name,
        group: object.group,
        actions: [
          //{ id: 'catch', label: 'Catch', time: 20, energy: -20 },
          { id: 'cut', label: 'Cut', time: 20, energy: -15 },
        ],
        items: object.items,
        attack: false,
        defense: false,
        dead: object.dead,
      })
    );
  },

  spawnDoggyAt: function (x, y, optCompanionProps) {
    const currentObjectsIdCounter = this.addObjectIdAt(x, y);
    const lootItemList = LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 8], 3);
    this.setObject(
      currentObjectsIdCounter,
      this.createGameObject({
        x: x,
        y: y,
        name: optCompanionProps?.name ?? 'doggy',
        group: 'animal',
        actions: [
          { id: 'pet', label: 'Pet', time: 5, energy: -5 },
          { id: 'scare', label: 'Scare Away', time: 5, energy: -5 },
          { id: 'cut', label: 'Cut', time: 20, energy: -15 },
        ],
        items: lootItemList,
        attack: optCompanionProps?.damage ?? 4,
        defense: optCompanionProps?.defense ?? 0,
        maxHealth: optCompanionProps?.maxHealth ?? 10,
        health: optCompanionProps?.health ?? 6,
        dead: optCompanionProps?.dead ?? false,
      })
    );

    return currentObjectsIdCounter;
  },

  setupWeapon: function (x, y, weaponName, forceStats) {
    const props = weaponProps[weaponName];
    const currentObjectsIdCounter = this.addObjectIdAt(x, y);
    this.setObject(
      currentObjectsIdCounter,
      this.createGameObject({
        x: x,
        y: y,
        name: weaponName,
        title: weaponName.replace('-', ' '),
        group: 'weapon',
        actions: props.preview
          ? [{ id: 'got-it', label: 'Got it!' }]
          : [{ id: 'equip', label: 'Equip' }],
        attack: forceStats?.attack || props.attack,
        defense: forceStats?.defense || props.defense,
        durability: forceStats?.durability || props.durability,
        preview: props.preview,
      })
    );
  },

  setupAllPaths: function () {
    // Setup all paths from imported JSON
    pathData.paths.forEach(path => {
      switch (path.type) {
        case 'vertical':
          PathUtils.setupPathVer(paths, path.x, path.y1, path.y2);
          break;
        case 'horizontal':
          PathUtils.setupPathHor(paths, path.x1, path.x2, path.y);
          break;
        case 'diagonalDown':
          PathUtils.setupPathDiaDown(paths, path.x1, path.x2, path.y);
          break;
        case 'diagonalUp':
          PathUtils.setupPathDiaUp(paths, path.x1, path.x2, path.y);
          break;
        case 'single':
          PathUtils.setupPath(paths, path.x, path.y);
          break;
        case 'remove':
          PathUtils.removePath(paths, path.x, path.y);
          break;
      }
    });
  },

  getWeaponProps: function (itemName) {
    if (itemName) {
      return weaponProps[itemName];
    } else {
      return weaponProps;
    }
  },

  getWeaponPropsUpgrades: function (itemName) {
    if (itemName) {
      return weaponPropsUpgrades[itemName];
    } else {
      return weaponPropsUpgrades;
    }
  },

  getBuildingProps: function () {
    return buildingProps;
  },
};
