import Binding from './binding.js';
import buildingData from '../data/map/building-instances.js';
import zombieData from '../data/map/zombie-instances.js';
import buildingDefinitions from '../data/definitions/building-definitions.js';
import characterDefinitions from '../data/definitions/character-definitions.js';
import itemsWeaponsDefinitions from '../data/definitions/items-weapons-definitions.js';

const mapSize = { width: 49, height: 45 };

// Destructure building definitions for use throughout the file
const { buildingTypes, buildingProps, buildingActions } = buildingDefinitions;

// Destructure items/weapons definitions
const { items, weaponProps, weaponPropsUpgrades } = itemsWeaponsDefinitions;

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

// all object properties go in here
// id
// name
// type = building, zombie, event
// { actions }
// locked
// looted
// zed nearby
// active / inactive
// distance
// attack / defense
// removed (or splice?)

var objects = [];
var objectsIdCounter = 0;
var zedCounter = 1;

var paths = new Array(mapSize.width);
for (let i = 0; i < paths.length; i += 1) {
  paths[i] = new Array(mapSize.height);
}

let cookingRecipes = {
  'roasted-meat': ['meat', 'sharp-stick', 1, 'roast'],
  'roasted-pepper': ['pepper', 'sharp-stick', 1, 'roast'],
  'roasted-mushroom': ['mushroom-1-2', 'sharp-stick', 1, 'roast'],
  'roasted-pumpkin': ['pumpkin', 'knife', 4, 'roast'],
  glue: ['bones', 'drink-1-2', 1, 'cook'],
};

let craftingRecipes = {
  'wooden-club': {
    items: [['fail', 'hacksaw'], ['stump']],
    exclusive: true,
    result: 'weapon',
  },
  'improvised-axe': {
    items: [['tape'], ['branch'], ['stone']],
    exclusive: true,
    result: 'weapon',
  },
  'improvised-whip': {
    items: [['rope'], ['branch']],
    exclusive: true,
    result: 'weapon',
  },
  'fishing-rod': {
    items: [['rope'], ['branch'], ['bone-hook']],
    exclusive: true,
    result: 'weapon',
  },
  fireplace: {
    items: [['stone'], ['stump'], ['straw-wheet']],
    exclusive: false,
    result: 'building',
  },
  barricades: {
    items: [['rope'], ['stump'], ['sharp-stick']],
    exclusive: false,
    result: 'building',
  },
  tape: {
    items: [['cloth'], ['glue']],
    exclusive: false,
    amount: 2,
    result: 'inventory',
  },
  'sharp-stick': {
    items: [['branch'], ['knife']],
    exclusive: false,
    result: 'inventory',
  },
  'bone-hook': {
    items: [['bones'], ['knife']],
    exclusive: false,
    result: 'inventory',
  },
  rope: {
    items: [['straw-wheet'], ['straw-wheet']],
    exclusive: false,
    result: 'inventory',
  },
};

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
    this.preloadBuidlings();
    this.preloadItems();
    this.preloadZombies();
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

  preloadBuidlings: function () {
    let images = [];
    for (const prop in buildingProps) {
      images[prop] = new Image();
      if (prop.startsWith('signpost-')) {
        images[prop].src = './img/buildings/signpost.png';
      } else if (prop === 'small-tree') {
        images[prop].src = './img/buildings/small-tree-1.png';
        images[prop] = new Image();
        images[prop].src = './img/buildings/small-tree-2.png';
      } else if (prop === 'big-tree') {
        images[prop].src = './img/buildings/big-tree-1.png';
        images[prop] = new Image();
        images[prop].src = './img/buildings/big-tree-2.png';
      } else if (prop === 'field') {
        images[prop].src = './img/buildings/field-1.png';
        images[prop] = new Image();
        images[prop].src = './img/buildings/field-2.png';
      } else {
        images[prop].src = './img/buildings/' + prop + '.png';
      }
    }
  },

  preloadItems: function () {
    let images = [];
    for (const prop in items) {
      images[prop] = new Image();
      if (items[prop][0] !== 'extra') {
        images[prop].src = './img/items/' + prop + '.PNG';
      } else {
        images[prop].src = './img/weapons/' + prop + '.png';
      }
    }
  },

  preloadUI: function () {
    let images = [];
    images[1] = new Image();
    images[1].src = './img/ui/logo.png';
    images[2] = new Image();
    images[2].src = './img/card/card-bg.png';
    images[3] = new Image();
    images[3].src = './img/card/card-bg-z.png';
    images[4] = new Image();
    images[4].src = './img/card/border-house.png';
    images[5] = new Image();
    images[5].src = './img/card/border-weapon.png';
    images[6] = new Image();
    images[6].src = './img/card/card-back.png';
    images[7] = new Image();
    images[7].src = './img/card/border-neutral.png';
    images[8] = new Image();
    images[8].src = './img/card/card-tutorial.png';
    images[9] = new Image();
    images[9].src = './img/card/chip.png';
    images[10] = new Image();
    images[10].src = './img/card/chip-border-neutral.png';
    images[11] = new Image();
    images[11].src = './img/characters/hero.png';
    images[12] = new Image();
    images[12].src = './img/ui/day-teaser-left.png';
    images[13] = new Image();
    images[13].src = './img/ui/day-teaser-right.png';
  },

  preloadZombies: function () {
    let images = [];
    images[1] = new Image();
    images[1].src = './img/zombies/zombie-1.png';
    images[2] = new Image();
    images[2].src = './img/zombies/zombie-2.png';
    images[3] = new Image();
    images[3].src = './img/zombies/zombie-3.png';
    images[4] = new Image();
    images[4].src = './img/zombies/scratch.png';
    images[5] = new Image();
    images[5].src = './img/zombies/rat.png';
    images[6] = new Image();
    images[6].src = './img/zombies/bee.png';
    images[7] = new Image();
    images[7].src = './img/zombies/undead.png';
    images[8] = new Image();
    images[8].src = './img/zombies/dead.png';
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
    // returns item modifiers for [hunger, thirst, energy]
    const charDef = characterDefinitions[type];
    if (charDef?.itemModifiers) {
      return charDef.itemModifiers[item];
    }
  },

  extractItemName: function (item) {
    return item
      .replace('-', ' ')
      .replace(' 1-2', '')
      .replace(' 1', '')
      .replace(' 2', '')
      .replace(' 3', '')
      .replace(' 4', '');
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
          inventory.items[item].damage = this.calcItemDamage(item);
          inventory.items[item].protection = this.calcItemProtection(item);
          inventory.items[item].durability = 0;
        }
      }
    } else if (itemProps !== undefined) {
      // weapon is added first time to inventory
      inventory.items[item] = {
        type: itemProps[0],
        name: item,
        amount: amount,
        damage: setDamage || this.calcItemDamage(item),
        protection: setProtection || this.calcItemProtection(item),
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
        damage: this.calcItemDamage(item), // props for battle mode
        protection: this.calcItemProtection(item), // props for battle mode
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
    const itemProps = this.getItem(item);
    const itemMods = this.getItemModifier(this.getGameProp('character'), item);
    if (itemProps) {
      return {
        name: item,
        type: itemProps[0],
        damage: this.calcItemDamage(item),
        protection: this.calcItemProtection(item),
        food: itemMods !== undefined ? itemProps[1] + itemMods[0] : itemProps[1],
        drink: itemMods !== undefined ? itemProps[2] + itemMods[1] : itemProps[2],
        energy: itemMods !== undefined ? itemProps[3] + itemMods[2] : itemProps[3],
      };
    } else {
      console.log('No props for item ' + item); // no props for item crate and duck
    }
  },

  calcItemDamage: function (item) {
    const itemProps = items[item];
    return itemProps[4] ? itemProps[4] : 1 + Math.round(itemProps[3] / 10);
  },

  calcItemProtection: function (item) {
    const itemProps = items[item];
    if (itemProps[5]) {
      return itemProps[5];
    } else {
      return itemProps[1] > itemProps[2]
        ? Math.round(itemProps[1] / 10)
        : Math.round(itemProps[2] / 10);
    }
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

  getLootBuildingProbability: function (buildingName) {
    // returns [firstItemChance, nextItemsChance]
    const type = this.getBuildingTypeOf(buildingName);

    if (buildingName === 'crate') {
      return [11, 0];
    }
    // house, car, farm, tree, church, train, shop, industrial, water, camping, corpse
    if (this.getGameProp('character') === 'treehugger') {
      if (
        type === 'house' ||
        type === 'car' ||
        type === 'train' ||
        type === 'shop' ||
        type === 'industrial'
      ) {
        return [7, 3];
      } else if (type === 'farm' || type === 'tree' || type === 'water' || type === 'camping') {
        return [11, 8];
      }
    } else if (this.getGameProp('character') === 'snackivore') {
      if (type === 'house' || type === 'car' || type === 'train' || type === 'shop') {
        return [11, 8];
      } else if (type === 'farm' || type === 'tree' || type === 'water') {
        return [7, 3];
      }
    } else if (this.getGameProp('character') === 'craftsmaniac') {
      if (
        type === 'industrial' ||
        type === 'car' ||
        type === 'train' ||
        buildingName === 'basement'
      ) {
        return [11, 8];
      }
    } else if (this.getGameProp('character') === 'cashmeister') {
      return [7, 3];
    }
    // defaults
    return [9, 6];
  },

  forceLootItemList: function (forceItems, maxAmount) {
    let lootItemList = [];
    for (let i = 0; i < forceItems.length; i += 1) {
      lootItemList.push({
        name: JSON.parse(JSON.stringify(forceItems[i])),
        amount: Math.round(Math.random() * maxAmount) || 1,
      });
    }
    return lootItemList;
  },

  createLootItemList: function (spawn, allItems, allProbabilities, amount) {
    const maxAmount = amount || 1;
    let lootItemList = [];
    let probability = allProbabilities[0];

    for (let i = 0; i < spawn; i += 1) {
      let randomItem = Math.floor(Math.random() * allItems.length);
      if (Math.random() * 10 < probability) {
        lootItemList.push({
          name: JSON.parse(JSON.stringify(allItems[randomItem])),
          amount: Math.round(Math.random() * maxAmount) || 1,
        });
        probability = allProbabilities[1];
      } else {
        lootItemList.push({
          name: JSON.parse(JSON.stringify(allItems[randomItem])),
          amount: 0,
        });
      }
      allItems.splice(randomItem, 1);
    }
    return lootItemList;
  },

  setupBuilding: function (x, y, buildingNamesArray, forceItems, forceInfested) {
    buildingNamesArray.forEach(buildingName => {
      const props = buildingProps[buildingName];
      const lootItemList = forceItems
        ? this.forceLootItemList(forceItems, props.amount)
        : this.createLootItemList(
            props.spawn,
            JSON.parse(JSON.stringify(props.items)),
            this.getLootBuildingProbability(buildingName, true),
            props.amount
          );
      const locked = Math.random() * props.locked > 1 ? true : false;
      const type = this.getBuildingTypeOf(buildingName);
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
          : this.getBuildingActionsFor(buildingName, locked, forceInfested || infested),
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
      let lootItemList = this.createLootItemList(
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
    let lootItemList = this.createLootItemList(2, ['meat', 'bones'], [11, 6], 2);
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
    let lootItemList = this.createLootItemList(1, ['meat'], [7, 5], 1);
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
    let lootItemList = this.createLootItemList(2, ['meat', 'bones'], [10, 6], 3);
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
    const lootItemList = this.createLootItemList(2, ['meat', 'bones'], [10, 8], 3);
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
    this.setupPathVer(18, 2, 44);
    this.setupPathVer(13, 8, 9);
    this.setupPathVer(28, 22, 29);
    this.setupPathVer(41, 26, 33);
    this.setupPathVer(35, 14, 17);
    this.setupPathVer(7, 14, 16);
    this.setupPathVer(7, 34, 38);
    this.setupPathVer(35, 31, 43);
    this.setupPathHor(16, 19, 3);
    this.setupPathHor(19, 23, 37);
    this.setupPathHor(15, 17, 15);
    this.setupPathHor(25, 35, 37);
    this.setupPathHor(9, 17, 10);
    this.setupPathHor(16, 19, 8);
    this.setupPathHor(21, 26, 5);
    this.setupPathHor(19, 22, 14);
    this.setupPathHor(12, 17, 21);
    this.setupPathHor(9, 17, 32);
    this.setupPathHor(28, 43, 30);
    this.setupPathHor(13, 17, 41);
    this.setupPathHor(32, 36, 41);
    this.setupPathDiaDown(8, 11, 17);
    this.setupPathDiaDown(19, 24, 31);
    this.setupPathDiaDown(4, 12, 36);
    this.setupPathDiaDown(28, 32, 32);
    this.setupPathDiaDown(27, 34, 6);
    this.setupPathDiaDown(26, 27, 20);
    this.setupPathDiaDown(30, 32, 7);
    this.setupPathDiaUp(8, 10, 13);
    this.setupPathDiaUp(29, 34, 23);
    // fill gaps
    this.setupPath(31, 9);
    this.setupPath(8, 33);
    this.setupPath(29, 31);
    this.setupPath(12, 42);
    this.setupPath(20, 4);
    this.setupPath(7, 8);
    this.setupPath(8, 9);
    // remove paths player shouldn't walk
    this.removePath(18, 40);
    this.removePath(18, 11);
    this.removePath(18, 12);
  },

  setupPath: function (x, y) {
    paths[x][y] = true;
  },

  setupPathVer: function (x, y1, y2) {
    for (var vert = y1; vert <= y2; vert += 1) {
      paths[x][vert] = true;
    }
  },

  setupPathHor: function (x1, x2, y) {
    for (var hor = x1; hor <= x2; hor += 1) {
      paths[hor][y] = true;
    }
  },

  setupPathDiaDown: function (x1, x2, y) {
    for (var dia = 0; dia <= x2 - x1; dia += 1) {
      paths[x1 + dia][y + dia] = true;
    }
  },

  setupPathDiaUp: function (x1, x2, y) {
    for (var dia = 0; dia <= x2 - x1; dia += 1) {
      paths[x1 + dia][y - dia] = true;
    }
  },

  removePath: function (x, y) {
    paths[x][y] = undefined;
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

  getBuildingTypeOf: function (buildingName) {
    for (const type in buildingTypes) {
      if (buildingTypes[type].includes(buildingName)) {
        return type;
      }
    }
  },

  getBuildingActionsFor: function (buildingName, locked, infested) {
    const buildingType = this.getBuildingTypeOf(buildingName);
    const actions = buildingActions[buildingType];
    let actionSet = [];
    // adding actions for certain character <-> building combos
    if (buildingName === 'fireplace') {
      if (
        this.getGameProp('character') !== 'craftsmaniac' &&
        this.getGameProp('character') !== 'cashmeister'
      )
        actionSet.push({ id: 'cook', label: 'cook', time: 30 });
      if (this.getGameProp('character') === 'treehugger')
        actionSet.push({ id: 'sleep', label: 'sleep', time: 120, energy: 60 });
    }
    if (actions !== undefined) {
      actions.forEach(action => {
        let singleAction = {};
        singleAction.name = action.split('|')[0]; // old
        singleAction.label = action.split('|')[0]; // new
        singleAction.id = action.split('|')[0].replaceAll(' ', '-'); // new
        if (
          (buildingName === 'pump' && singleAction.id === 'fish') ||
          (buildingName === 'outhouse' && singleAction.id === 'break-door') ||
          (buildingName === 'outhouse' && singleAction.id === 'unlock-door') ||
          (buildingName === 'small-tree' && singleAction.id === 'rest') ||
          (buildingName === 'big-tree' && singleAction.id === 'cut-down') ||
          (buildingName === 'fireplace' && singleAction.id === 'break-door') ||
          (buildingName === 'fireplace' && singleAction.id === 'unlock-door') ||
          (buildingName === 'fireplace' && singleAction.id === 'scout-area') ||
          (buildingName === 'fireplace' && singleAction.id === 'search') ||
          (buildingName === 'barricades' && singleAction.id === 'break-door') ||
          (buildingName === 'barricades' && singleAction.id === 'unlock-door') ||
          (buildingName === 'barricades' && singleAction.id === 'scout-area') ||
          (buildingName === 'barricades' && singleAction.id === 'search') ||
          (buildingName === 'seating' && singleAction.id === 'break-door') ||
          (buildingName === 'seating' && singleAction.id === 'unlock-door') ||
          (buildingName === 'seating' && singleAction.id === 'scout-area') ||
          (buildingName === 'seating' && singleAction.id === 'sleep') ||
          (buildingName === 'well' && singleAction.id === 'fish')
        ) {
          // these are exceptions for certain building <-> action combos that make no sense
        } else if (
          (!locked && singleAction.id === 'smash-window') ||
          (!locked && singleAction.id === 'unlock-door') ||
          (!locked && singleAction.id === 'break-door')
        ) {
          // these are exceptions for certain stats <-> action combos that make no sense
        } else if (
          (this.getGameProp('character') === 'snackivore' && singleAction.id === 'drink') ||
          (this.getGameProp('character') === 'furbuddy' && singleAction.id === 'cut')
        ) {
          // removing actions for certain character <-> building combos
          // see fireplace above for craftsmaniac/cooking
        } else {
          singleAction.time = parseInt(action.split('|')[1]);
          singleAction.energy = parseInt(action.split('|')[2] || 0);
          actionSet.push(singleAction);
        }

        if (
          singleAction.id === 'gather' ||
          singleAction.id === 'search' ||
          singleAction.id === 'rest' ||
          singleAction.id === 'sleep' ||
          singleAction.id === 'cut-down' ||
          singleAction.id === 'cook' ||
          singleAction.id === 'drink' ||
          singleAction.id === 'read'
        ) {
          singleAction.needsUnlock = true;
        } else {
          singleAction.needsUnlock = false;
        }
        if (infested && (singleAction.id === 'search' || singleAction.id === 'gather')) {
          singleAction.critical = true;
        }
        singleAction.locked = undefined;
      });
    }
    return actionSet;
  },
};
