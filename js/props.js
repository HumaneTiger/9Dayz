import Binding from './binding.js';
import buildingData from '../data/map/building-instances.js';
import zombieData from '../data/map/zombie-instances.js';
import pathData from '../data/map/path-instances.js';
import buildingDefinitions from '../data/definitions/building-definitions.js';
import characterDefinitions from '../data/definitions/character-definitions.js';
import itemsWeaponsDefinitions from '../data/definitions/items-weapons-definitions.js';
import recipeDefinitions from '../data/definitions/recipe-definitions.js';
import {
  getBuildingTypeOf,
  getLootBuildingProbability,
  getBuildingActionsFor,
} from '../data/utils/building-utils.js';
import { createLootItemList, forceLootItemList } from '../data/utils/loot-utils.js';
import {
  calcItemDamage,
  calcItemProtection,
  calcItemProps,
  extractItemName,
  getItemModifier,
} from '../data/utils/item-utils.js';
import {
  setupPath,
  setupPathVer,
  setupPathHor,
  setupPathDiaDown,
  setupPathDiaUp,
  removePath,
} from '../data/utils/path-utils.js';

const mapSize = { width: 49, height: 45 };

// Destructure building definitions for use throughout the file
const { buildingProps, buildingActions } = buildingDefinitions;

// Destructure items/weapons definitions
const { items, weaponProps, weaponPropsUpgrades } = itemsWeaponsDefinitions;

// Destructure recipe definitions
const { cookingRecipes, craftingRecipes } = recipeDefinitions;

var inventory = {
  items: new Array(),
  itemNumbers: 0,
  leftHand: null,
  rightHand: null,
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

var game = {
  mode: 'real',
  character: 'everyman',
  startMode: 1,
  startDay: 1,
  timeMode: 'day',
  viewMode: '',
  scaleFactor: 0,
  tutorial: false,
  battle: false,
  gamePaused: true,
  local: location.href.startsWith('http://127.0.0.1'),
  speed: 4000, // 4000
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
};

// all generated ids go in here
var objectIdsAt = new Array(mapSize.width);
for (let i = 0; i < objectIdsAt.length; i += 1) {
  objectIdsAt[i] = new Array(mapSize.height);
}

var objects = [];
var objectsIdCounter = 0;
var zedCounter = 1;

var paths = new Array(mapSize.width);
for (let i = 0; i < paths.length; i += 1) {
  paths[i] = new Array(mapSize.height);
}

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
    this.bind();
  },

  bind: function () {
    new Binding({
      object: inventory,
      property: 'itemNumbers',
      element: document.getElementById('inventory-numbers'),
    });
    new Binding({
      object: crafting,
      property: 'total',
      element: document.getElementById('crafting-total'),
    });
    new Binding({
      object: game,
      property: 'character',
      element: document.getElementById('character').querySelector('.slot-hero h2'),
    });
  },

  hourlyTasks: function (hour) {
    if (hour === 21) {
      this.setGameProp('timeMode', 'night');
    }
    if (hour === 5) {
      this.setGameProp('timeMode', 'day');
    }
  },

  /* ==================== the good ones ==================== */

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

  saveCheckpoint: function (targetLocationName, playerPosition, playerStats) {
    let saveCheckpoint = {
      targetLocationName: targetLocationName,
      gameTime: window.timeIsUnity,
      playerCharacter: this.getGameProp('character'),
      playerPosition: playerPosition,
      playerStats: playerStats,
      inventoryItems: {},
    };
    // https://stackoverflow.com/questions/29585812/json-stringify-does-not-stringify-nested-arrays
    for (let item in inventory.items) {
      if (inventory.items[item].amount && inventory.items[item].amount > 0) {
        saveCheckpoint.inventoryItems[item] = inventory.items[item];
      }
    }
    localStorage.setItem('saveCheckpoint', JSON.stringify(saveCheckpoint));
    document
      .getElementById('actions')
      .querySelector('li.mixed .game-saved')
      .classList.add('active');
    window.setTimeout(() => {
      document
        .getElementById('actions')
        .querySelector('li.mixed .game-saved')
        .classList.remove('active');
    }, 2000);
  },

  getGameProp: function (prop) {
    return game[prop];
  },

  setGameProp: function (prop, value) {
    game[prop] = value;
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

  getItemModifier: function (type, item) {
    return getItemModifier(type, item);
  },

  extractItemName: function (item) {
    return extractItemName(item);
  },

  /* active crafting number */
  getCrafting: function () {
    return crafting;
  },

  getCookingRecipes: function () {
    return cookingRecipes;
  },

  getCraftingRecipes: function () {
    return craftingRecipes;
  },

  getObjectIdsAt: function (x, y) {
    if (objectIdsAt[x] !== undefined) {
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
    if (objectIdsAt[x][y] !== undefined) {
      objectIdsAt[x][y].push(id);
    } else {
      objectIdsAt[x][y] = [];
      objectIdsAt[x][y].push(id);
    }
    objectsIdCounter += 1;
    return id;
  },

  getObject: function (id) {
    return objects[id];
  },

  setObject: function (id, data) {
    objects[id] = data;
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

  getInventoryPresets: function (character) {
    return characterDefinitions[character]?.inventoryPreset || {};
  },

  addWeaponToInventory: function (item, addAmount, setWeaponProps) {
    const amount = parseInt(addAmount),
      setDamage = setWeaponProps.damage,
      setProtection = setWeaponProps.protection,
      setDurability = setWeaponProps.durability,
      itemProps = items[item];

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
          inventory.items[item].damage = calcItemDamage(item);
          inventory.items[item].protection = calcItemProtection(item);
          inventory.items[item].durability = 0;
        }
      }
    } else if (itemProps !== undefined) {
      // weapon is added first time to inventory
      inventory.items[item] = {
        type: itemProps[0],
        name: item,
        amount: amount,
        damage: setDamage || calcItemDamage(item),
        protection: setProtection || calcItemProtection(item),
        durability: setDurability,
      };
    } else {
      console.log('adding weapon "' + item + '" to inventory failed');
    }
    this.calcTotalInventoryItems();
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
        damage: calcItemDamage(item), // props for battle mode
        protection: calcItemProtection(item), // props for battle mode
      };
    } else {
      console.log('adding item "' + item + '" to inventory failed');
    }
    this.calcTotalInventoryItems();
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
    return calcItemProps(item, this.getGameProp('character'));
  },

  setupAllBuildings: function () {
    // ONLY FOR TUTORIAL (hardcoded - special case)
    if (this.getGameProp('tutorial')) {
      this.setupBuilding(18, 44, ['crate'], ['drink-5', 'bread-1', 'wooden-club']);
      this.setupWeapon(18, 44, 'axe', {
        attack: this.getWeaponProps('axe').attack / 2,
        defense: this.getWeaponProps('axe').defense / 2,
        durability: this.getWeaponProps('axe').durability / 2,
      });
    }

    // Setup all regular buildings from imported JSON
    buildingData.buildings.forEach(entry => {
      this.setupBuilding(entry.x, entry.y, entry.buildings, entry.items, entry.infested);
    });
  },

  setupAllZeds: function () {
    // Setup all zombies from imported JSON
    zombieData.zombies.forEach(entry => {
      this.setZedAt(entry.x, entry.y, entry.amount);
    });
  },

  setupBuilding: function (x, y, buildingNamesArray, forceItems, forceInfested) {
    buildingNamesArray.forEach(buildingName => {
      const props = buildingProps[buildingName];
      const lootItemList = forceItems
        ? forceLootItemList(forceItems, props.amount)
        : createLootItemList(
            props.spawn,
            JSON.parse(JSON.stringify(props.items)),
            getLootBuildingProbability(buildingName, true),
            props.amount
          );
      const locked = Math.random() * props.locked > 1 ? true : false;
      const type = getBuildingTypeOf(buildingName);
      const infested = type === 'house' && Math.random() < 0.5 ? true : false;

      const currentObjectsIdCounter = this.addObjectIdAt(x, y);
      this.setObject(currentObjectsIdCounter, {
        x: x,
        y: y,
        name: buildingName,
        title: buildingName.startsWith('signpost-')
          ? 'signpost'
          : buildingName.replace('-1', '').replace('-2', '').replace('-', ' '),
        type: type,
        group: 'building',
        text: false,
        actions: props.preview
          ? [{ id: 'got-it', label: 'Got it!' }]
          : getBuildingActionsFor(buildingName, locked, forceInfested || infested),
        items: lootItemList,
        locked: locked,
        looted: false,
        infested: forceInfested || infested,
        zednearby: null,
        active: true,
        inreach: false,
        discovered: false,
        distance: null,
        preview: props.preview,
        attack: undefined,
        defense: undefined, // use later for building cards in battle
        dead: undefined,
        disabled: false,
        removed: false,
      });
    });
  },

  setZedAt: function (x, y, amount) {
    for (var i = 0; i < amount; i += 1) {
      const distance = Math.sqrt(
        Math.pow(this.getGameProp('playerPosition').x - x, 2) +
          Math.pow(this.getGameProp('playerPosition').y - y, 2)
      );

      let attack = Math.floor(Math.random() * 6 + Math.min(distance / 3, 10) + 1); // increase attack with distance
      let defense = Math.floor(Math.random() * 9 + Math.min(distance / 2.5, 10)); // increase defense with distance
      let lootItemList = createLootItemList(
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
      let name = 'zombie-' + zedCounter;

      zedCounter += 1;
      zedCounter > 3 ? (zedCounter = 1) : false;

      const currentObjectsIdCounter = this.addObjectIdAt(x, y);
      this.setObject(currentObjectsIdCounter, {
        x: x,
        y: y,
        name: name,
        title: '',
        type: undefined,
        group: 'zombie',
        text: false,
        actions: [
          { id: 'lure', label: 'Lure', time: 20, energy: -15 },
          { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
          { id: 'search', label: 'Search', time: 20, energy: -5 },
          { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
        ],
        items: lootItemList,
        locked: undefined,
        looted: false,
        infested: false,
        zednearby: null,
        active: true,
        inreach: false,
        discovered: false,
        distance: null,
        attack: attack,
        defense: defense,
        dead: false,
        fighting: false,
        disabled: false,
        removed: false,
      });
    }
  },

  setRatAt: function (x, y) {
    let lootItemList = createLootItemList(2, ['meat', 'bones'], [11, 6], 2);
    let name = 'rat';

    const currentObjectsIdCounter = this.addObjectIdAt(x, y);
    this.setObject(currentObjectsIdCounter, {
      x: x,
      y: y,
      name: name,
      title: '',
      type: 'rat',
      group: 'zombie',
      text: false,
      actions: [
        { id: 'lure', label: 'Lure', time: 20, energy: -15 },
        { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
        { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
        { id: 'cut', label: 'Cut', time: 20, energy: -15 },
      ],
      items: lootItemList,
      locked: undefined,
      looted: false,
      infested: false,
      zednearby: null,
      active: true,
      inreach: false,
      discovered: false,
      distance: null,
      attack: Math.floor(Math.random() * 3 + 1),
      defense: Math.floor(Math.random() * 4 + 2),
      dead: false,
      fighting: false,
      disabled: false,
      removed: false,
    });
  },

  setBeeAt: function (x, y) {
    let lootItemList = createLootItemList(1, ['meat'], [7, 5], 1);
    let name = 'bee';

    const currentObjectsIdCounter = this.addObjectIdAt(x, y);
    this.setObject(currentObjectsIdCounter, {
      x: x,
      y: y,
      name: name,
      title: '',
      type: 'bee',
      group: 'zombie',
      text: false,
      actions: [
        { id: 'lure', label: 'Lure', time: 20, energy: -15 },
        { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
        { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
        { id: 'cut', label: 'Cut', time: 20, energy: -15 },
      ],
      items: lootItemList,
      locked: undefined,
      looted: false,
      infested: false,
      zednearby: null,
      active: true,
      inreach: false,
      discovered: false,
      distance: null,
      attack: Math.floor(Math.random() * 3 + 1),
      defense: Math.floor(Math.random() * 4 + 2),
      dead: false,
      fighting: false,
      disabled: false,
      removed: false,
    });
  },

  spawnRatsAt: function (x, y) {
    const amount = Math.round(Math.random() * 5) || 3;
    let spawnedRatIds = [];
    for (var i = 0; i < amount; i += 1) {
      this.setRatAt(x, y);
      spawnedRatIds.push(objectsIdCounter - 1); // at this place the countor is one ahead
    }
    return spawnedRatIds;
  },

  spawnBeesAt: function (x, y) {
    const amount = Math.round(Math.random() * 2) + 4;
    let spawnedBeesIds = [];
    for (var i = 0; i < amount; i += 1) {
      this.setBeeAt(x, y);
      spawnedBeesIds.push(objectsIdCounter - 1); // at this place the countor is one ahead
    }
    return spawnedBeesIds;
  },

  spawnAnimalAt: function (name, x, y) {
    let lootItemList = createLootItemList(2, ['meat', 'bones'], [10, 6], 3);
    const currentObjectsIdCounter = this.addObjectIdAt(x, y);
    this.setObject(currentObjectsIdCounter, {
      x: x,
      y: y,
      name: name,
      title: '',
      type: undefined,
      group: 'animal',
      text: false,
      actions: [
        //{ id: 'catch', label: 'Catch', time: 20, energy: -20 },
        { id: 'cut', label: 'Cut', time: 20, energy: -15 },
      ],
      items: lootItemList,
      locked: undefined,
      looted: false,
      infested: false,
      zednearby: null,
      active: true,
      inreach: false,
      discovered: false,
      distance: null,
      attack: false,
      defense: false,
      dead: true,
      fighting: false,
      disabled: false,
      removed: false,
    });
  },

  spawnDoggyAt: function (x, y, optCompanionProps) {
    const currentObjectsIdCounter = this.addObjectIdAt(x, y);
    const lootItemList = createLootItemList(2, ['meat', 'bones'], [10, 8], 3);
    this.setObject(currentObjectsIdCounter, {
      x: x,
      y: y,
      name: optCompanionProps?.name ?? 'doggy',
      title: '',
      type: undefined,
      group: 'animal',
      text: false,
      actions: [
        { id: 'pet', label: 'Pet', time: 5, energy: -5 },
        { id: 'scare', label: 'Scare Away', time: 5, energy: -5 },
        { id: 'cut', label: 'Cut', time: 20, energy: -15 },
      ],
      items: lootItemList,
      locked: undefined,
      looted: false,
      infested: false,
      zednearby: null,
      active: true,
      inreach: false,
      discovered: false,
      distance: null,
      attack: optCompanionProps?.damage ?? 4,
      defense: optCompanionProps?.defense ?? 0,
      maxHealth: optCompanionProps?.maxHealth ?? 10,
      health: optCompanionProps?.health ?? 6,
      dead: optCompanionProps?.dead ?? false,
      fighting: false,
      disabled: false,
      removed: false,
    });

    return currentObjectsIdCounter;
  },

  setupWeapon: function (x, y, weaponName, forceStats) {
    let props = weaponProps[weaponName];
    const currentObjectsIdCounter = this.addObjectIdAt(x, y);
    this.setObject(currentObjectsIdCounter, {
      x: x,
      y: y,
      name: weaponName,
      title: weaponName.replace('-', ' '),
      type: undefined,
      group: 'weapon',
      text: false,
      actions: props.preview
        ? [{ id: 'got-it', label: 'Got it!' }]
        : [{ id: 'equip', label: 'Equip' }],
      items: [],
      locked: undefined,
      looted: false,
      zednearby: null,
      active: true,
      inreach: false,
      discovered: false,
      distance: null,
      attack: forceStats?.attack || props.attack,
      defense: forceStats?.defense || props.defense,
      durability: forceStats?.durability || props.durability,
      dead: undefined,
      preview: props.preview,
      disabled: false,
      removed: false,
    });
  },

  setupAllPaths: function () {
    // Setup all paths from imported JSON
    pathData.paths.forEach(path => {
      switch (path.type) {
        case 'vertical':
          setupPathVer(paths, path.x, path.y1, path.y2);
          break;
        case 'horizontal':
          setupPathHor(paths, path.x1, path.x2, path.y);
          break;
        case 'diagonalDown':
          setupPathDiaDown(paths, path.x1, path.x2, path.y);
          break;
        case 'diagonalUp':
          setupPathDiaUp(paths, path.x1, path.x2, path.y);
          break;
        case 'single':
          setupPath(paths, path.x, path.y);
          break;
        case 'remove':
          removePath(paths, path.x, path.y);
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
