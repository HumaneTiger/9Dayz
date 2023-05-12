import Binding from './binding.js'

const mapSize = { width: 45, height: 45 };

var inventory = {
  items: new Array(),
  itemNumbers: 0,
  leftHand: null,
  rightHand: null
};

var crafting = {
  total: 0
};

var gameMode = 'easy';

var quadrant = new Array(mapSize.width);
for (var i = 0; i < quadrant.length; i += 1) { quadrant[i] = new Array(mapSize.height); }

var zeds = new Array(mapSize.width);
for (var i = 0; i < zeds.length; i += 1) { zeds[i] = new Array(mapSize.height); }

var buildings = new Array(mapSize.width);
for (var i = 0; i < buildings.length; i += 1) { buildings[i] = new Array(mapSize.height); }

var paths = new Array(mapSize.width);
for (var i = 0; i < paths.length; i += 1) { paths[i] = new Array(mapSize.height); }

var buildingTypes = {
  'house': ['house', 'barn', 'old-villa', 'farm-house', 'town-house'],
  'car': ['car-1', 'car-2'],
  'farm': ['field', 'compost', 'scarecrow'],
  'tree': [ 'small-tree', 'big-tree'],
  'church': [ 'church' ],
  'signpost': [ 'signpost-1', 'signpost-2', 'signpost-3', 'signpost-4', 'signpost-5', 'signpost-6', 'signpost-7' ],
  'place': [ 'milton', 'sobor' ],
  'train': [ 'train-wreck-2', 'train-wreck-1' ],
  'shop': ['market', 'gas-station'],
  'industrial': ['tool-shed', 'garage'],
  'water': ['well', 'jetty', 'pump'],
  'camping': ['seating', 'log-cabine', 'cottage', 'outhouse', 'fireplace']
};

var buildingProps = {
  'barn': { worthful: 1, spawn: 2, items: ['claw', 'duck', 'straw-wheet', 'pumpkin'] },
  'big-tree': { worthful: 2, spawn: 3, items: ['acorn', 'branch', 'fruit-1', 'fruit-2', 'fruit-3', 'mushroom-1', 'stone'] },
  'outhouse': { worthful: 0, spawn: 1, items: ['exodus', 'acorn', 'hawthorn', 'rosehip', 'straw-wheet'] },
  'pump': { worthful: 0, spawn: 1, items: ['branch', 'physalis', 'reef', 'spanner'] },
  'house': { worthful: 2, spawn: 3, items: ['bread-1', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-5', 'exodus'] },
  'farm-house': { worthful: 2, spawn: 3, items: ['bread-2', 'wine', 'pumpkin', 'carrot', 'knife', 'pepper', 'tomato', 'exodus'] },
  'town-house': { worthful: 3, spawn: 3, items: ['bread-2', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-5', 'exodus'] },
  'car-1': { worthful: 1, spawn: 2, items: ['snack-1', 'snack-2', 'energy-pills', 'drink-3', 'drink-4', 'tape', 'spanner'] },
  'signpost-1': { worthful: 0, spawn: 0, items: [] },
  'signpost-2': { worthful: 0, spawn: 0, items: [] },
  'signpost-3': { worthful: 0, spawn: 0, items: [] },
  'signpost-4': { worthful: 0, spawn: 0, items: [] },
  'signpost-5': { worthful: 0, spawn: 0, items: [] },
  'signpost-6': { worthful: 0, spawn: 0, items: [] },
  'signpost-7': { worthful: 0, spawn: 0, items: [] },
  'old-villa': { worthful: 3, spawn: 3, items: ['bread-2', 'wine', 'knife', 'wine', 'exodus', 'books'] },
  'car-2': { worthful: 1, spawn: 2, items: ['snack-1', 'snack-2', 'energy-pills', 'drink-3', 'drink-4', 'tape', 'spanner'] },
  'field': { worthful: 1, spawn: 3, items: ['carrot', 'pepper', 'duck', 'pumpkin', 'mushroom-2', 'straw-wheet', 'tomato'], buidlings: ['scarecrow'] },
  'compost': { worthful: 0, spawn: 1, items: ['carrot', 'pepper', 'pumpkin', 'mushroom-2', 'tomato'] },
  'scarecrow': { worthful: 0, spawn: 1, items: ['straw-wheet', 'straw-wheet', 'pumpkin'] },
  'small-tree': { worthful: 0, spawn: 2, items: ['branch', 'hawthorn', 'physalis', 'rosehip', 'mushroom-1', 'stone'] },
  'church': { worthful: 2, spawn: 3, items: ['books', 'wine', 'bread-2'] },
  'milton': { worthful: 0, spawn: 0, items: [] },
  'sobor': { worthful: 0, spawn: 0, items: [] },
  'train-wreck-2': { worthful: 2, spawn: 2, items: ['energy-pills', 'pincers', 'spanner'] },
  'train-wreck-1': { worthful: 1, spawn: 3, items: ['snack-1', 'snack-2', 'drink-2', 'drink-5', 'wine'] },
  'market': { worthful: 2, spawn: 3, items: ['bread-1', 'bread-2', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-3', 'drink-4', 'exodus'] },
  'gas-station': { worthful: 2, spawn: 3, items: ['bread-1', 'bread-2', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-1', 'exodus'] },
  'tool-shed': { worthful: 2, spawn: 2, items: ['brush', 'claw', 'fail', 'hacksaw', 'exodus', 'knife', 'mallet', 'pincers', 'spanner', 'tape'] },
  'garage': { worthful: 3, spawn: 3, items: ['brush', 'claw', 'fail', 'hacksaw', 'exodus', 'knife', 'mallet', 'pincers', 'spanner', 'tape'] },
  'well': { worthful: 0, spawn: 1, items: ['branch', 'rosehip', 'reef', 'stone'] },
  'jetty': { worthful: 0, spawn: 1, items: ['reef', 'rosehip', 'stone', 'duck'] },
  'seating': { worthful: 0, spawn: 1, items: ['drink-1', 'drink-2', 'snack-1', 'snack-2'] },
  'log-cabine': { worthful: 1, spawn: 2, items: ['stump', 'straw-wheet', 'branch', 'drink-3', 'drink-4', 'snack-1', 'snack-2'] },
  'cottage': { worthful: 2, spawn: 3, items: ['bread-2', 'wine', 'snack-1', 'snack-2', 'knife', 'drink-2', 'drink-5', 'exodus'] },
  'fireplace': { worthful: 2, spawn: 0, items: [] }
};

var buildingActions = {
  'house': [ 'scout area|30', 'break door|10|30', 'search|20', 'rest|60' ],
  'car': [ 'scout area|30', 'smash window|20', 'search|20', 'rest|60' ],
  'farm': [ 'gather|20','scout area|30' ],
  'tree': [ 'gather|20', 'scout area|30', 'cut down|15|25', 'rest|60' ],
  'church': [ 'scout area|30', 'break door|10|30', 'search|20', 'rest|60' ],
  'signpost': [ 'read|1' ],
  'place': [ 'head toward|0', 'quick travel|0' ],
  'train': [ 'search|20', 'scout area|30' ],
  'shop': [ 'scout area|30', 'break door|30|20', 'search|20' ],
  'industrial': [ 'scout area|30', 'break door|45|30', 'search|20' ],
  'water': [ 'gather|20', 'drink|5' ],
  'camping': [ 'scout area|30', 'break door|5|30', 'search|20', 'rest|60' ]
};

var weapons = {
  'axe': [0, 8],
  'baseball-bat': [25, 4],
  'hammer': [0, 5],
  'saw': [0, 1],
  'wooden-club': [25, 2],
  'wrench': [0, 7]
};

var events = {
  '18-44': {
    title: 'Waking Up',
    text: 'You wake up on the side of the road. Behind you a destroyed city and barricades. You have to reach the ship in the North!<br><img src="./img/icons/wasd.png">'
  },
  '18-43': {
    title: 'Gather',
    text: 'There are some trees growing here. You should look around them for useful things and pick everything up. Watch your stats - hunger and thirst are a constant threat in this broken world.'
  },
  '18-41': {
    title: 'Zombies!',
    text: 'The road in front of you is blocked. Apparently, some unfortunates "survived" this accident, and now walk around as undead.<br>Be careful! They are really dangerous.'
  },
  '17-41': {
    title: 'Zombie 101',
    text: 'Try to lure single Zeds towards you. Attacking them will cause other Zeds in the area join the fight. When you walk right into them, they  will attack you first.'
  },
  '30-7': {
    title: 'You found it!',
    text: 'After all the hardships you made it to the ship in time! You take your beloved in your arms and together you look over the devastated land while the ship is heading towards a hopefully safe future.'
  },
  '18-29': {
    title: 'The Horde!',
    text: 'You see a huge horde of Zombies slowly shambling across the street. At this speed it will take days before they are gone. You better turn around and search for an alternative route!'
  },
};

var targetLocations = {
  'Lakeside Camp Resort': [5, 37],
  'Rocksprings': [22, 34],
  'Haling Cove': [16, 8],
  'Litchfield': [15, 23],
  'Greenleafton': [33, 35],
  'Billibalds Farm': [40, 30],
  'Camp Silverlake': [28, 22],
  'Harbor Gas Station': [34, 16]
};

var items = {
  'acorn': ['eat', 1, 0, 0],
  'branch': ['craft', 0, 0, 0, 1, 1],
  'bread-1': ['eat', 45, 0, 20],
  'bread-2': ['eat', 40, 0, 20],
  'brush': ['craft', 0, 0, 0, 2, 2],
  'carrot': ['eat', 6, 4, 0],
  'claw': ['craft', 0, 0, 0, 4, 2],
  'drink-1': ['drink', 0, 30, 0],
  'drink-2': ['drink', 0, 30, 0],
  'drink-3': ['drink', 5, 25, 5],
  'drink-4': ['drink', 5, 25, 5],
  'drink-5': ['drink', 10, 30, 10],
  'fruit-1': ['eat', 2, 8, 2],
  'fruit-2': ['eat', 4, 8, 2],
  'fruit-3': ['eat', 3, 8, 2],
  'books': ['craft', 0, 0, 0, 0, 2],
  'duck': ['craft', 0, 0, 0, 2, 2],
  'energy-pills': ['eat', 0, 0, 50, 1, 1],
  'exodus': ['craft', 0, 0, 0, 4, 2],
  'fail': ['craft', 0, 0, 0, 3, 2],
  'hacksaw': ['craft', 0, 0, 0, 3, 2],
  'hawthorn': ['eat', 2, 2, 0],
  'knife': ['craft', 0, 0, 0, 4, 1],
  'mallet': ['craft', 0, 0, 0, 5, 1],
  'meat': ['eat', 3, 5, 0],
  'roasted-meat': ['eat', 30, 15, 30],
  'pepper': ['eat', 8, 5, 0],
  'roasted-pepper': ['eat', 22, 5, 20],
  'physalis': ['eat', 2, 2, 0],
  'pincers': ['craft', 0, 0, 0, 3, 2],
  'pumpkin': ['eat', 30, 15, 10],
  'reef': ['craft', 0, 0, 0, 1, 1],
  'rosehip': ['eat', 2, 2, 0],
  'mushroom-1': ['eat', 2, 2, 0],
  'mushroom-2': ['eat', 4, 3, 0],
  'roasted-mushroom': ['eat', 11, 5, 10],
  'snack-1': ['eat', 25, 0, 10],
  'snack-2': ['eat', 25, 0, 10],
  'spanner': ['craft', 0, 0, 0, 3, 1],
  'stone': ['craft', 0, 0, 0, 4, 1],
  'straw-wheet': ['craft', 0, 0, 0, 0, 0],
  'stump': ['craft', 0, 0, 0, 3, 3],
  'tape': ['craft', 0, 0, 0, 1, 0],
  'tomato': ['eat', 8, 5, 0],
  'wine': ['drink', 5, 35, 20],
  'improvised-axe': ['extra', 0, 0, 0, 8, 4],
  'wooden-club': ['extra', 0, 0, 0, 6, 3]
};

export default {
  
  init() {
    this.setupAllBuildings();
    this.setupAllZeds();
    this.setupAllPaths();
    this.bind();
    this.preloadBuidlings();
    this.preloadItems();
    this.preloadZombies();
  },

  bind: function() {
    new Binding({
        object: inventory,
        property: 'itemNumbers',
        element: document.getElementById('inventory-numbers')
    })
    new Binding({
      object: crafting,
      property: 'total',
      element: document.getElementById('crafting-total')
  })
},

  preloadBuidlings: function() {
    let images = [];
    for (const prop in buildingProps) {
      images[i] = new Image();
      images[i].src = '../img/buildings/' + (prop.startsWith('signpost-') ? 'signpost' : prop) + '.png';
    };
  },
  preloadItems: function() {
    let images = [];
    for (const prop in items) {
      images[i] = new Image();
      images[i].src = '../img/items/'+prop+'.PNG';
    };
  },
  preloadZombies: function() {
    let images = [];
    images[1] = new Image();
    images[1].src = '../img/zombies/zombie-1.png';
    images[2] = new Image();
    images[2].src = '../img/zombies/zombie-2.png';
    images[3] = new Image();
    images[3].src = '../img/zombies/zombie-3.png';
    images[4] = new Image();
    images[4].src = '../img/zombies/scratch.png';
  },

  getGameMode: function() {
    return gameMode;
  },

  setGameMode: function(mode) {
    gameMode = mode;
  },

  getAllQuadrants: function() {
    return quadrant;
  },

  getAllBuildings: function() {
    return buildings;
  },
  
  getAllZeds: function() {
    return zeds;
  },

  removeBuilding: function(x, y, name) {

  },

  getAllEvents: function() {
    return events;
  },
  
  getWeaponProps: function() {
    return weapons;
  },
  
  getAllPaths: function() {
    return paths;
  },

  getAllItems: function() {
    return items;
  },

  getAllTargetLocations: function() {
    return targetLocations;
  },
  
  getInventory: function() {
    return inventory;
  },
  
  getCrafting: function() {
    return crafting;
  },
  
  addToInventory: function(item, amount, durability) {
    amount = parseInt(amount);
    if (inventory.items[item] !== undefined) {
      inventory.items[item].amount += amount;
      inventory.items[item].amount < 0 ? inventory.items[item].amount = 0 : false;
      if (durability !== undefined) {
        inventory.items[item].durability += durability;
        if (inventory.items[item].durability === 0) { inventory.items[item].amount = 0 }
      }
    } else {
      inventory.items[item] = {
        name: item,
        amount: amount,
        durability: durability
      }
    }
    inventory.itemNumbers = 0;
    for (item in inventory.items) {
      if (inventory.items[item].amount && inventory.items[item].amount > 0) {
        inventory.itemNumbers += inventory.items[item].amount;
      }
    }
  },
  
  getMapSize: function() {
    return mapSize;
  },
  
  setupAllBuildings: function() {
    // GAS STATION
    this.setupBuilding(17, 25, ['gas-station']);
    this.setupBuilding(36, 16, ['gas-station']);
    this.setupBuilding(9, 9, ['gas-station']);
    this.setupBuilding(15, 22, ['garage']);
    // TOOL SHED
    this.setupBuilding(19, 39, ['tool-shed']);
    this.setupBuilding(34, 39, ['tool-shed']);
    this.setupBuilding(17, 31, ['tool-shed']);
    this.setupBuilding(13, 22, ['tool-shed']);
    // JETTY
    this.setupBuilding(4, 36, ['jetty']);
    this.setupBuilding(26, 20, ['jetty']);
    // MARKETS
    this.setupBuilding(30, 31, ['market']);
    this.setupBuilding(21, 32, ['market']);
    this.setupBuilding(17, 22, ['market']);
    this.setupBuilding(7, 7, ['market']);
    this.setupBuilding(15, 9, ['market']);
    // FIELDS
    this.setupBuilding(28, 33, ['field']);
    this.setupBuilding(17, 38, ['field']);
    this.setupBuilding(26, 38, ['field']);
    this.setupBuilding(27, 38, ['field']);
    this.setupBuilding(38, 31, ['field']);
    this.setupBuilding(39, 31, ['scarecrow']);
    this.setupBuilding(40, 31, ['field']);
    this.setupBuilding(42, 31, ['field']);
    this.setupBuilding(43, 31, ['field']);
    this.setupBuilding(40, 32, ['field']);
    this.setupBuilding(36, 38, ['field']);
    this.setupBuilding(8, 12, ['field']);
    this.setupBuilding(9, 11, ['field', 'big-tree']);
    this.setupBuilding(40, 33, ['compost']);
    this.setupBuilding(29, 34, ['compost']);
    this.setupBuilding(44, 31, ['compost']);
    this.setupBuilding(25, 38, ['compost']);
    this.setupBuilding(42, 32, ['compost', 'compost']);
    this.setupBuilding(43, 29, ['well']);
    this.setupBuilding(29, 22, ['well', 'small-tree']);
    // TOWN HOUSES
    this.setupBuilding(17, 9, ['town-house']);
    this.setupBuilding(17, 7, ['town-house']);
    this.setupBuilding(21, 6, ['town-house']);
    this.setupBuilding(19, 5, ['town-house']);
    // HOUSES
    this.setupBuilding(31, 34, ['house']);
    this.setupBuilding(10, 41, ['house']);
    this.setupBuilding(17, 39, ['house']);
    this.setupBuilding(22, 35, ['house']);
    this.setupBuilding(23, 36, ['house']);
    this.setupBuilding(34, 42, ['house']);
    this.setupBuilding(19, 23, ['house']);
    this.setupBuilding(19, 9, ['house']);
    this.setupBuilding(17, 5, ['house']);
    // OLD VILLA
    this.setupBuilding(36, 43, ['old-villa']);
    this.setupBuilding(23, 14, ['old-villa']);
    // FARM HOUSES
    this.setupBuilding(29, 32, ['farm-house']);
    this.setupBuilding(20, 33, ['farm-house']);
    this.setupBuilding(24, 37, ['farm-house']);
    this.setupBuilding(44, 30, ['farm-house']);
    // COTTAGES
    this.setupBuilding(6, 39, ['cottage']);
    this.setupBuilding(28, 21, ['cottage']);
    this.setupBuilding(14, 15, ['cottage']);
    this.setupBuilding(20, 8, ['cottage']);
    // LOG CABINE
    this.setupBuilding(6, 37, ['log-cabine']);
    this.setupBuilding(4, 37, ['log-cabine']);
    this.setupBuilding(5, 36, ['log-cabine']);
    this.setupBuilding(26, 22, ['log-cabine', 'small-tree']);
    this.setupBuilding(27, 20, ['log-cabine', 'small-tree']);
    // SEATING
    this.setupBuilding(5, 38, ['seating']);
    this.setupBuilding(19, 22, ['seating']);
    this.setupBuilding(34, 16, ['seating']);
    this.setupBuilding(27, 22, ['seating', 'small-tree']);
    // OUTHOUSE
    this.setupBuilding(6, 35, ['outhouse']);
    this.setupBuilding(29, 21, ['outhouse']);
    // BARNS
    this.setupBuilding(33, 36, ['barn']);
    this.setupBuilding(26, 36, ['barn']);
    this.setupBuilding(29, 35, ['barn']);
    this.setupBuilding(42, 29, ['barn']);
    this.setupBuilding(36, 39, ['barn']);
    this.setupBuilding(10, 12, ['barn']);
    // CHURCHES
    this.setupBuilding(34, 31, ['church']);
    this.setupBuilding(23, 34, ['church']);
    this.setupBuilding(14, 8, ['church']);
    // CARs
    this.setupBuilding(31, 35, ['car-1']);
    this.setupBuilding(35, 37, ['car-1']);
    this.setupBuilding(8, 39, ['car-1']);
    this.setupBuilding(18, 40, ['car-1']);
    this.setupBuilding(19, 41, ['signpost-1']);
    this.setupBuilding(16, 31, ['signpost-2']);
    this.setupBuilding(19, 36, ['signpost-3']);
    this.setupBuilding(19, 21, ['signpost-4']);
    this.setupBuilding(36, 31, ['signpost-5']);
    this.setupBuilding(29, 29, ['signpost-6']);
    this.setupBuilding(31, 22, ['signpost-7']);
    this.setupBuilding(23, 35, ['car-1']);
    this.setupBuilding(35, 41, ['car-1']);
    this.setupBuilding(32, 30, ['car-2']);
    this.setupBuilding(6, 38, ['car-2']);
    this.setupBuilding(26, 37, ['car-2']);
    this.setupBuilding(43, 30, ['car-2']);
    this.setupBuilding(18, 41, ['car-2']);
    this.setupBuilding(17, 23, ['car-1', 'car-2']);
    this.setupBuilding(28, 24, ['car-1']);
    this.setupBuilding(28, 23, ['car-2']);
    this.setupBuilding(34, 15, ['car-2']);
    this.setupBuilding(21, 14, ['car-1']);
    this.setupBuilding(18, 12, ['car-1', 'car-2']);
    this.setupBuilding(18, 11, ['car-1']);
    this.setupBuilding(8, 10, ['car-1']);
    this.setupBuilding(18, 6, ['car-1']);
    this.setupBuilding(18, 2, ['car-2']);
    this.setupBuilding(7, 9, ['car-2']);
    // TRAIN
    this.setupBuilding(19, 40, ['train-wreck-1']);
    this.setupBuilding(20, 40, ['train-wreck-2']);
    // TREES
    this.setupBuilding(17, 43, ['big-tree']);
    this.setupBuilding(17, 44, ['small-tree']);
    this.setupBuilding(19, 44, ['small-tree']);
    this.setupBuilding(30, 33, ['big-tree', 'small-tree']);
    this.setupBuilding(30, 35, ['small-tree']);
    this.setupBuilding(30, 36, ['big-tree']);
    this.setupBuilding(36, 37, ['big-tree']);
    this.setupBuilding(36, 36, ['small-tree']);
    this.setupBuilding(36, 35, ['small-tree']);
    this.setupBuilding(34, 33, ['big-tree', 'small-tree']);
    this.setupBuilding(12, 43, ['big-tree']);
    this.setupBuilding(19, 38, ['small-tree']);
    this.setupBuilding(9, 42, ['small-tree']);
    this.setupBuilding(10, 43, ['small-tree']);
    this.setupBuilding(11, 44, ['small-tree']);
    this.setupBuilding(7, 40, ['big-tree']);
    this.setupBuilding(4, 38, ['big-tree', 'small-tree']);
    this.setupBuilding(6, 36, ['small-tree', 'big-tree']);
    this.setupBuilding(17, 33, ['big-tree', 'small-tree']);
    this.setupBuilding(17, 34, ['small-tree', 'big-tree']);
    this.setupBuilding(17, 35, ['big-tree']);
    this.setupBuilding(16, 33, ['small-tree']);
    this.setupBuilding(19, 33, ['big-tree']);
    this.setupBuilding(19, 32, ['big-tree', 'small-tree']);
    this.setupBuilding(21, 34, ['small-tree']);
    this.setupBuilding(22, 33, ['small-tree', 'big-tree']);
    this.setupBuilding(25, 36, ['big-tree', 'small-tree']);
    this.setupBuilding(34, 44, ['small-tree', 'big-tree']);
    this.setupBuilding(35, 44, ['small-tree']);
    this.setupBuilding(36, 44, ['big-tree']);
    this.setupBuilding(36, 42, ['big-tree']);
    this.setupBuilding(40, 29, ['big-tree', 'small-tree']);
    this.setupBuilding(40, 28, ['small-tree', 'big-tree']);
    this.setupBuilding(40, 27, ['small-tree', 'big-tree']);
    this.setupBuilding(14, 22, ['big-tree', 'small-tree']);
    this.setupBuilding(29, 24, ['big-tree']);
    this.setupBuilding(36, 14, ['big-tree']);
    this.setupBuilding(35, 13, ['small-tree']);
    this.setupBuilding(34, 14, ['small-tree']);
    this.setupBuilding(33, 13, ['big-tree', 'small-tree']);
    this.setupBuilding(22, 13, ['small-tree']);
    this.setupBuilding(34, 14, ['small-tree']);
    this.setupBuilding(21, 15, ['small-tree', 'big-tree']);
    this.setupBuilding(22, 15, ['big-tree']);
    this.setupBuilding(16, 16, ['small-tree', 'big-tree']);
    this.setupBuilding(15, 14, ['big-tree', 'small-tree']);
    this.setupBuilding(16, 14, ['small-tree']);
    this.setupBuilding(15, 16, ['big-tree', 'small-tree']);
    this.setupBuilding(14, 16, ['mall-tree', 'big-tree']);
    this.setupBuilding(12, 9, ['big-tree', 'small-tree']);
    this.setupBuilding(12, 8, ['small-tree']);
    this.setupBuilding(16, 8, ['big-tree', 'small-tree']);
    this.setupBuilding(19, 7, ['small-tree', 'big-tree']);
    this.setupBuilding(19, 6, ['small-tree']);
    this.setupBuilding(23, 6, ['small-tree']);
    this.setupBuilding(24, 6, ['small-tree', 'big-tree']);
    this.setupBuilding(27, 7, ['small-tree', 'big-tree']);
    this.setupBuilding(28, 8, ['small-tree']);
    this.setupBuilding(28, 6, ['small-tree', 'big-tree']);
  },

  setupAllZeds: function() {
    this.setZedAt(31, 36, 1);
    this.setZedAt(30, 35, 1);
    this.setZedAt(30, 34, 1);
    this.setZedAt(17, 40, 1);
    this.setZedAt(18, 40, 1);
    this.setZedAt(4, 36, 1);
    this.setZedAt(5, 38, 1);
    this.setZedAt(7, 37, 1);
    this.setZedAt(7, 34, 1);
    this.setZedAt(12, 44, 1);
    this.setZedAt(36, 43, 1);
    this.setZedAt(32, 41, 1);
    this.setZedAt(36, 41, 1);
    this.setZedAt(17, 38, 1);
    this.setZedAt(16, 38, 1);
    this.setZedAt(35, 37, 2);
    this.setZedAt(33, 31, 2);
    this.setZedAt(33, 30, 1);
    this.setZedAt(32, 29, 1);
    this.setZedAt(42, 33, 1);
    this.setZedAt(43, 31, 1);
    this.setZedAt(44, 30, 1);
    this.setZedAt(24, 35, 2);
    this.setZedAt(24, 36, 1);
    this.setZedAt(21, 34, 1);
    this.setZedAt(27, 37, 1);
    this.setZedAt(18, 32, 1);
    this.setZedAt(17, 33, 1);
    this.setZedAt(22, 33, 1);
    this.setZedAt(26, 20, 1);
    this.setZedAt(28, 22, 1);
    this.setZedAt(27, 22, 2);
    // HORDE 1
    this.setZedAt(18, 26, 1);
    this.setZedAt(17, 27, 2);
    this.setZedAt(18, 27, 2);
    this.setZedAt(19, 27, 2);
    this.setZedAt(18, 28, 1);
    // HORDE 2
    this.setZedAt(34, 17, 2);
    this.setZedAt(35, 17, 2);
    this.setZedAt(36, 17, 2);
    this.setZedAt(35, 18, 1);
  },

  setupBuilding: function(x, y, buildingNamesArray) {
    if (quadrant[x][y] === undefined) {
      quadrant[x][y] = buildingNamesArray;
      return true;
    }
    return false;
  },

  setZedAt: function(x, y, value) {
    zeds[x][y] = value;
  },

  addZedAt: function(x, y, name) {
    if (zeds[x][y] === 1 || zeds[x][y] === 2 || zeds[x][y] === 3) {
      zeds[x][y] = [];
    }
    zeds[x][y].push(name);
  },

  getZedAt: function(x, y) {
    return zeds[x][y];
  },

  setupAllPaths: function() {
    this.setupPathVer(18, 2, 44); this.setupPathVer(13, 8, 9); this.setupPathVer(28, 22, 29); this.setupPathVer(41, 26, 33); this.setupPathVer(35, 14, 17);
    this.setupPathVer(7, 14, 16); this.setupPathVer(7, 34, 38); this.setupPathVer(35, 31, 43);
    this.setupPathHor(16, 19, 3); this.setupPathHor(19, 23, 37); this.setupPathHor(15, 17, 15);
    this.setupPathHor(25, 35, 37); this.setupPathHor(9, 17, 10); this.setupPathHor(16, 19, 8); this.setupPathHor(21, 26, 5); this.setupPathHor(19, 22, 14);
    this.setupPathHor(12, 17, 21); this.setupPathHor(9, 17, 32); this.setupPathHor(28, 43, 30); this.setupPathHor(13, 17, 41); this.setupPathHor(32, 36, 41);
    this.setupPathDiaDown(8, 11, 17); this.setupPathDiaDown(19, 24, 31); this.setupPathDiaDown(4, 12, 36); this.setupPathDiaDown(28, 32, 32);
    this.setupPathDiaDown(27, 34, 6); this.setupPathDiaDown(26, 27, 20); this.setupPathDiaDown(30, 32, 7);
    this.setupPathDiaUp(8, 10, 13); this.setupPathDiaUp(29, 34, 23);
    // fill gaps
    this.setupPath(31, 9); this.setupPath(8, 33); this.setupPath(29, 31); this.setupPath(12, 42); 
    this.setupPath(20, 4); this.setupPath(7, 8); this.setupPath(8, 9); 
    // remove paths player shouldn't walk
    this.removePath(18, 40);
    this.removePath(18, 11); this.removePath(18, 12);
  },

  setupPath: function(x, y) {
    paths[x][y] = true;
  },

  setupPathVer: function(x, y1, y2) {
    for (var vert = y1; vert <= y2; vert += 1) {
      paths[x][vert] = true;
    }
  },

  setupPathHor: function(x1, x2, y) {
    for (var hor = x1; hor <= x2; hor += 1) {
      paths[hor][y] = true;
    }
  },

  setupPathDiaDown: function(x1, x2, y) {
    for (var dia = 0; dia <= x2 - x1; dia += 1) {
      paths[x1 + dia][y + dia] = true;
    }
  },

  setupPathDiaUp: function(x1, x2, y) {
    for (var dia = 0; dia <= x2 - x1; dia += 1) {
      paths[x1 + dia][y - dia] = true;
    }
  },

  removePath: function(x, y) {
    paths[x][y] = undefined;
  },

  getBuildingProps: function() {
    return buildingProps;
  },

  getBuildingTypeOf: function(buildingName) {
    for (const type in buildingTypes) {
      if (buildingTypes[type].includes(buildingName)) {
        return type;
      }
    }  
  },

  getBuildingActionsFor: function(buildingName) {
    const buildingType = this.getBuildingTypeOf(buildingName);
    const actions = buildingActions[buildingType];
    let actionSet = [];
    if (buildingName === 'fireplace') actionSet.push({name: 'cook', time: 30});
    if (actions !== undefined) {
      actions.forEach(action => {
        let singleAction = {};
        singleAction.name = action.split("|")[0];
        if ((buildingName === 'pump' && singleAction.name === 'fish') ||
            (buildingName === 'pump' && singleAction.name === 'gather') ||
            (buildingName === 'outhouse' && singleAction.name === 'break door') ||
            (buildingName === 'small-tree' && singleAction.name === 'rest') ||
            (buildingName === 'big-tree' && singleAction.name === 'cut down') ||
            (buildingName === 'fireplace' && singleAction.name === 'break door') ||
            (buildingName === 'fireplace' && singleAction.name === 'scout area') ||
            (buildingName === 'fireplace' && singleAction.name === 'search') ||
            (buildingName === 'seating' && singleAction.name === 'break door') ||
            (buildingName === 'seating' && singleAction.name === 'scout area') ||
            (buildingName === 'seating' && singleAction.name === 'sleep') ||
            (buildingName === 'well' && singleAction.name === 'gather') ||
            (buildingName === 'well' && singleAction.name === 'fish')) {
          // these are exceptions for certain building <-> action combos that make no sense
        } else {
          singleAction.time = action.split("|")[1];
          singleAction.energy = action.split("|")[2];
          actionSet.push(singleAction);  
        }
      });
    }
    return actionSet;
  }

}
