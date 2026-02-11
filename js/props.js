import buildingData from '../data/map/building-instances.js';
import zombieData from '../data/map/zombie-instances.js';
import pathData from '../data/map/path-instances.js';
import buildingDefinitions from '../data/definitions/building-definitions.js';
import characterDefinitions from '../data/definitions/character-definitions.js';
import itemsWeaponsDefinitions from '../data/definitions/items-weapons-definitions.js';
import BuildingUtils from '../data/utils/building-utils.js';
import LootUtils from '../data/utils/loot-utils.js';
import PathUtils from '../data/utils/path-utils.js';
import RngUtils from './utils/rng-utils.js';
import GameState from './game-state.js';
import ObjectState from './object-state.js';
import InventoryManager from './inventory-manager.js';

const mapSize = { width: 49, height: 45 };

// Destructure building definitions for use throughout the file
const { buildingProps, buildingActions } = buildingDefinitions;

// Destructure items/weapons definitions
const { items, weaponProps, weaponPropsUpgrades } = itemsWeaponsDefinitions;

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
    GameState.init();
    this.setupAllPaths();
  },

  /* === GameState delegations === */

  getGameProps: function () {
    return GameState.getGameProps();
  },

  getGameProp: function (prop) {
    return GameState.getGameProp(prop);
  },

  setGameProp: function (prop, value) {
    GameState.setGameProp(prop, value);
  },

  updateTimeIsUnity: function (updates) {
    GameState.updateTimeIsUnity(updates);
  },

  pauseGame: function (pause) {
    GameState.pauseGame(pause);
  },

  modifyObjectProperties: function () {
    const character = GameState.getGameProp('character');
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

  getPlayerProps: function () {
    return GameState.getPlayerProps();
  },

  changePlayerProp: function (prop, change) {
    return GameState.changePlayerProp(prop, change);
  },

  getCompanion: function () {
    return GameState.getCompanion();
  },

  setCompanion: function (newCompanion) {
    GameState.setCompanion(newCompanion);
  },

  getCrafting: function () {
    return GameState.getCrafting();
  },

  /* === inventory === */
  getAllItems: function () {
    return items;
  },

  getItem: function (item) {
    return items[item];
  },

  /* === InventoryManager delegations === */

  getInventory: function () {
    return InventoryManager.getInventory();
  },

  getInventoryItemNumbers: function () {
    return InventoryManager.getInventoryItemNumbers();
  },

  getInventoryPresets: function (character) {
    return InventoryManager.getInventoryPresets(character);
  },

  beginInventoryBatch: function () {
    InventoryManager.beginInventoryBatch();
  },

  endInventoryBatch: function () {
    InventoryManager.endInventoryBatch();
  },

  addWeaponToInventory: function (item, addAmount, setWeaponProps) {
    InventoryManager.addWeaponToInventory(item, addAmount, setWeaponProps);
  },

  getWeaponTotal: function () {
    return InventoryManager.getWeaponTotal();
  },

  addItemToInventory: function (item, addAmount) {
    InventoryManager.addItemToInventory(item, addAmount);
  },

  calcTotalInventoryItems: function () {
    InventoryManager.calcTotalInventoryItems();
  },

  calcItemProps: function (item) {
    return InventoryManager.calcItemProps(item, this.getGameProp('character'));
  },

  addCompanion: function (objectId) {
    const object = ObjectState.getObject(objectId);
    GameState.addCompanion(object);
  },

  /* === ObjectState delegations === */

  createGameObject: function (overrides = {}) {
    return ObjectState.createGameObject(overrides);
  },

  getObjectIdsAt: function (x, y) {
    return ObjectState.getObjectIdsAt(x, y);
  },

  getObjectsAt: function (x, y) {
    return ObjectState.getObjectsAt(x, y);
  },

  addObjectIdAt: function (x, y) {
    return ObjectState.addObjectIdAt(x, y);
  },

  getObject: function (id) {
    return ObjectState.getObject(id);
  },

  setObject: function (id, data) {
    ObjectState.setObject(id, data);
  },

  getAllObjects: function () {
    return ObjectState.getAllObjects();
  },

  setAllObjects: function (newObjects) {
    ObjectState.setAllObjects(newObjects);
  },

  getAllObjectIdsAt: function () {
    return ObjectState.getAllObjectIdsAt();
  },

  setAllObjectIdsAt: function (newObjectIdsAt) {
    ObjectState.setAllObjectIdsAt(newObjectIdsAt);
  },

  getObjectsIdCounter: function () {
    return ObjectState.getObjectsIdCounter();
  },

  setObjectsIdCounter: function (value) {
    ObjectState.setObjectsIdCounter(value);
  },

  getZedCounter: function () {
    return ObjectState.getZedCounter();
  },

  setZedCounter: function (value) {
    ObjectState.setZedCounter(value);
  },

  getAllPaths: function () {
    return paths;
  },

  getAllTargetLocations: function () {
    return targetLocations;
  },

  setupAllBuildings: function () {
    // ONLY FOR TUTORIAL (hardcoded - special case)
    if (this.getGameProp('tutorial')) {
      this.setupBuilding(
        18,
        44,
        ['crate'],
        false,
        LootUtils.forceLootItemList(['drink-5', 'fruit-bread', 'wooden-club'])
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
      const locked = props.locked === 11 ? true : Math.random() * props.locked > 1 ? true : false;

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
      const currentZedCounter = ObjectState.getZedCounter();
      const name = 'zombie-' + currentZedCounter;

      ObjectState.setZedCounter((currentZedCounter % 3) + 1); // Cycle through 1, 2, 3

      const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
      ObjectState.setObject(
        currentObjectsIdCounter,
        ObjectState.createGameObject({
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
