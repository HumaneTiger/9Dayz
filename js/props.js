import Binding from './binding.js'

const mapSize = { width: 49, height: 45 };

var inventory = {
  items: new Array(),
  itemNumbers: 0,
  leftHand: null,
  rightHand: null
};

var crafting = {
  total: 0
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
  firstInventoryOpen: false
}

// all generated ids go in here
var objectIdsAt = new Array(mapSize.width);
for (var i = 0; i < objectIdsAt.length; i += 1) { objectIdsAt[i] = new Array(mapSize.height); }

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
for (var i = 0; i < paths.length; i += 1) { paths[i] = new Array(mapSize.height); }

var inventoryPresets = [];
inventoryPresets['everyman'] = {
  'tomato': 2,
  'drink-2': 1,
  'snack-1': 1,
  'knife': 1,
  'energy-pills': 1,
  'pepper': 1
}
inventoryPresets['treehugger'] = {
  'mushroom-1': 2,
  'acorn': 1,
  'branch': 1,
  'fruit-2': 2,
  'knife': 1
}
inventoryPresets['snackivore'] = {
  'snack-1': 3,
  'drink-5': 1,
  'snack-2': 1
}
inventoryPresets['craftsmaniac'] = {
  'spanner': 1,
  'tape': 1,
  'knife': 1,
  'drink-2': 1,
  'pincers': 1,
  'nails': 1,
}
inventoryPresets['furbuddy'] = {}
inventoryPresets['hardcharger'] = {}
inventoryPresets['cashmeister'] = {}

var buildingTypes = {
  'house': ['house', 'barn', 'cottage', 'old-villa', 'farm-house', 'town-house', 'basement'],
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
  'container': ['crate'],
  'camping': ['seating', 'log-cabine', 'outhouse', 'fireplace'],
  'corpse': ['human-corpse-1']
};

var buildingProps = {
  'barn': { locked: 1.2, spawn: 2, items: ['claw', 'duck', 'straw-wheet', 'pumpkin', 'nails'] },
  'big-tree': { locked: 0, spawn: 3, items: ['acorn', 'branch', 'fruit-1', 'fruit-2', 'fruit-3', 'mushroom-1', 'stone'], amount: 2 },
  'outhouse': { locked: 0, spawn: 1, items: ['exodus', 'acorn', 'hawthorn', 'rosehip', 'straw-wheet'] },
  'pump': { locked: 0, spawn: 1, items: ['branch', 'physalis', 'reef', 'spanner'] },
  'house': { locked: 2, spawn: 3, items: ['bread-1', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-5', 'exodus', 'cloth'] },
  'basement': { locked: 0, spawn: 3, items: ['wine', 'tape', 'cloth', 'hacksaw', 'bones', 'spanner', 'books', 'nails'] },
  'farm-house': { locked: 2, spawn: 3, items: ['bread-2', 'wine', 'pumpkin', 'carrot', 'knife', 'pepper', 'tomato', 'exodus', 'nails'] },
  'town-house': { locked: 3, spawn: 3, items: ['bread-2', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-5', 'exodus', 'cloth'] },
  'car-1': { locked: 2, spawn: 2, items: ['snack-1', 'snack-2', 'energy-pills', 'drink-3', 'drink-4', 'tape', 'spanner', 'cloth'] },
  'signpost-1': { locked: 0, spawn: 0, items: [] },
  'signpost-2': { locked: 0, spawn: 0, items: [] },
  'signpost-3': { locked: 0, spawn: 0, items: [] },
  'signpost-4': { locked: 0, spawn: 0, items: [] },
  'signpost-5': { locked: 0, spawn: 0, items: [] },
  'signpost-6': { locked: 0, spawn: 0, items: [] },
  'signpost-7': { locked: 0, spawn: 0, items: [] },
  'old-villa': { locked: 3, spawn: 3, items: ['bread-2', 'wine', 'knife', 'wine', 'exodus', 'books'] },
  'car-2': { locked: 2, spawn: 2, items: ['snack-1', 'snack-2', 'energy-pills', 'drink-3', 'drink-4', 'tape', 'spanner'] },
  'field': { locked: 0, spawn: 3, items: ['carrot', 'pepper', 'duck', 'pumpkin', 'mushroom-2', 'straw-wheet', 'tomato'], buidlings: ['scarecrow'], amount: 2 },
  'compost': { locked: 0, spawn: 1, items: ['carrot', 'pepper', 'pumpkin', 'mushroom-2', 'tomato'], amount: 2 },
  'scarecrow': { locked: 0, spawn: 1, items: ['straw-wheet', 'straw-wheet', 'pumpkin', 'cloth'], amount: 2 },
  'small-tree': { locked: 0, spawn: 2, items: ['branch', 'hawthorn', 'physalis', 'rosehip', 'mushroom-1', 'stone', 'straw-wheet'] },
  'church': { locked: 2, spawn: 3, items: ['books', 'wine', 'bread-2'] },
  'milton': { locked: 0, spawn: 0, items: [] },
  'sobor': { locked: 0, spawn: 0, items: [] },
  'train-wreck-2': { locked: 0, spawn: 2, items: ['energy-pills', 'pincers', 'spanner'] },
  'train-wreck-1': { locked: 0, spawn: 3, items: ['snack-1', 'snack-2', 'drink-2', 'drink-5', 'wine'] },
  'market': { locked: 2, spawn: 3, items: ['bread-1', 'bread-2', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-3', 'drink-4', 'exodus'] },
  'gas-station': { locked: 2, spawn: 3, items: ['bread-1', 'bread-2', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-1', 'exodus'] },
  'tool-shed': { locked: 2, spawn: 2, items: ['cloth', 'claw', 'fail', 'hacksaw', 'exodus', 'knife', 'mallet', 'pincers', 'tape'] },
  'garage': { locked: 3, spawn: 3, items: ['cloth', 'claw', 'fail', 'hacksaw', 'exodus', 'knife', 'mallet', 'pincers', 'tape', 'nails'] },
  'well': { locked: 0, spawn: 1, items: ['rosehip', 'bones', 'mushroom-1', 'stone', 'froggy']},
  'jetty': { locked: 0, spawn: 1, items: ['reef', 'rosehip', 'stone', 'duck', 'froggy'], amount: 2 },
  'seating': { locked: 0, spawn: 1, items: ['drink-1', 'drink-2', 'snack-1', 'snack-2'] },
  'log-cabine': { locked: 1.4, spawn: 2, items: ['stump', 'straw-wheet', 'branch', 'cloth', 'drink-3', 'drink-4', 'snack-1', 'snack-2'] },
  'cottage': { locked: 2, spawn: 3, items: ['bread-2', 'wine', 'snack-1', 'snack-2', 'knife', 'drink-2', 'drink-5', 'exodus'] },
  'fireplace': { locked: 0, spawn: 0, items: [] },
  'crate': { locked: 11, spawn: 1, items: ['axe', 'wrench', 'baseball-bat'] }, // always locked
  'human-corpse-1': { locked: 0, spawn: 3, items: ['wine', 'snack-1', 'bread-2', 'energy-pills', 'snack-2', 'knife', 'drink-2', 'drink-5', 'exodus', 'cloth', 'wooden-club'] },
};

var buildingActions = {
  'house': [ 'break door|10|-15', 'search|20|-10', 'scout area|30', 'rest|60|+30', 'sleep|120|+60' ],
  'car': [ 'smash window|20', 'search|20|-5', 'scout area|30', 'rest|60|+20' ],
  'farm': [ 'gather|15|-10','scout area|30' ],
  'tree': [ 'gather|15|-5', 'scout area|30', 'cut down|25|-25', 'rest|60|+15' ],
  'church': [ 'break door|10|-15', 'search|20|-10', 'scout area|30', 'rest|60|+30' ],
  'signpost': [ 'read|1' ],
  'place': [ 'head toward|0', 'quick travel|0' ],
  'train': [ 'search|20|-5', 'scout area|30' ],
  'shop': [ 'break door|30|-20', 'search|20|-10', 'scout area|30' ],
  'industrial': [ 'break door|30|-20', 'search|20|-15', 'scout area|30' ],
  'water': [ 'gather|15|-5', 'drink|10' ],
  'camping': [ 'break door|10|-15', 'search|20|-10', 'scout area|30', 'rest|60|+20' ],
  'corpse': ['search|15|-5'],
  'container': ['break lock|30|-20', 'search|15|-5'],
};

var cookingRecipes = {
  'roasted-meat': [ 'meat','sharp-stick', 1, 'roast' ],
  'roasted-pepper': [ 'pepper','sharp-stick', 1, 'roast' ],
  'roasted-mushroom': [ 'mushroom-1-2','sharp-stick', 1, 'roast' ],
  'roasted-pumpkin': [ 'pumpkin','knife', 4, 'roast' ],
  'glue': [ 'bones','drink-1-2', 1, 'cook' ],
};

var craftingRecipes = {
  'wooden-club': { 
    items: [ ['fail','hacksaw'], ['stump'] ],
    exclusive: true,
    result: 'weapon'
  },
  'improvised-axe': {
    items: [ ['tape'], ['branch'], ['stone'] ],
    exclusive: true,
    result: 'weapon'
  },
  'fireplace': {
    items: [ ['stone'], ['stump'], ['straw-wheet'] ],
    exclusive: false,
    result: 'building'
  },
  'tape': {
    items: [ ['cloth'], ['glue'] ],
    exclusive: false,
    result: 'inventory'
  },
  'sharp-stick': {
    items: [ ['branch'], ['knife'] ],
    exclusive: false,
    result: 'inventory'
  }
};

var weaponProps = {
  'baseball-bat': {attack: 10, defense: 3, durability: 4},
  'wrench': {attack: 14, defense: 4, durability: 4},
  'axe': {attack: 12, defense: 6, durability: 4},
  'improvised-axe': {attack: 8, defense: 4, durability: 3},
  'wooden-club': {attack: 6, defense: 3, durability: 3}
};

var weaponPropsUpgrades = {
  'baseball-bat': {
    attack: { amount: 1, item: 'nails' },
    durability: { amount: 1, item: 'tape' },
  },
  'wrench': { 
    durability: { amount: 1, item: 'tape' },
    defense: { amount: 1, item: 'brush' },
  },
  'axe': { 
    attack: { amount: 1, item: 'fail' },
    durability: { amount: 1, item: 'tape' },
  },
  'improvised-axe': { 
    attack: { amount: 1, item: 'pincers' },
    defense: { amount: 2, item: 'knife' },
    durability: { amount: 1, item: 'tape' },
  },
  'wooden-club': { 
    attack: { amount: 1, item: 'hacksaw' },
    defense: { amount: 1, item: 'brush' },
    durability: { amount: 1, item: 'tape' },
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

/* ['type', hunger, thirst, energy, attack, defense] */
var items = {
  'acorn': ['eat', 1, 0, 0],
  'bones': ['craft', 0, 0, 0, 2, 0],
  'branch': ['craft', 0, 0, 0, 1, 1],
  'bread-1': ['eat', 45, 0, 20],
  'bread-2': ['eat', 40, 0, 20],
  'cloth': ['craft', 0, 0, 0, 4, 2],
  'books': ['craft', 0, 0, 0, 0, 2],
  'carrot': ['eat', 6, 4, 0],
  'claw': ['craft', 0, 0, 0, 4, 2],
  'drink-1': ['drink', 0, 30, 0],
  'drink-2': ['drink', 0, 35, 0],
  'drink-3': ['drink', 5, 25, 5],
  'drink-4': ['drink', 5, 25, 5],
  'drink-5': ['drink', 10, 30, 10],
  'fruit-1': ['eat', 2, 8, 2],
  'fruit-2': ['eat', 4, 8, 2],
  'fruit-3': ['eat', 3, 8, 2],
  'glue': ['craft', 0, 0, 0, 5, 2],
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
  'pumpkin': ['eat', 15, 15, 10],
  'roasted-pumpkin': ['eat', 8, 6, 7],
  'reef': ['craft', 0, 0, 0, 1, 1],
  'rosehip': ['eat', 2, 2, 0],
  'mushroom-1': ['eat', 2, 2, 0],
  'mushroom-2': ['eat', 4, 3, 0],
  'roasted-mushroom': ['eat', 11, 5, 10],
  'sharp-stick': ['craft', 0, 0, 0, 3, 3],
  'snack-1': ['eat', 25, 0, 10],
  'snack-2': ['eat', 25, 0, 10],
  'spanner': ['craft', 0, 0, 0, 3, 1],
  'nails': ['craft', 0, 0, 0, 2, 1],
  'stone': ['craft', 0, 0, 0, 4, 1],
  'straw-wheet': ['craft', 0, 0, 0, 0, 0],
  'stump': ['craft', 0, 0, 0, 3, 3],
  'tape': ['craft', 0, 0, 0, 1, 0],
  'tomato': ['eat', 4, 8, 3],
  'wine': ['drink', 5, 35, 20],
  'improvised-axe': ['extra', 0, 0, 0, weaponProps['improvised-axe'].attack, weaponProps['improvised-axe'].defense],
  'wooden-club': ['extra', 0, 0, 0, weaponProps['wooden-club'].attack, weaponProps['wooden-club'].defense],
  'wrench': ['extra', 0, 0, 0, weaponProps['wrench'].attack, weaponProps['wrench'].defense],
  'baseball-bat': ['extra', 0, 0, 0, weaponProps['baseball-bat'].attack, weaponProps['baseball-bat'].defense],
  'axe': ['extra', 0, 0, 0, weaponProps['axe'].attack, weaponProps['axe'].defense]
};
var itemModifiers = {
  'snackivore': {
    'acorn': [-1, 0, 0],
    'bread-1': [5, 0, 10],
    'bread-2': [5, 0, 10],
    'carrot': [-4, -2, 0],
    'drink-3': [10, 20, 10],
    'drink-4': [10, 20, 10],
    'drink-5': [15, 30, 15],
    'fruit-1': [-2, -4, -2],
    'fruit-2': [-2, -4, -2],
    'fruit-3': [-2, -4, -2],
    'energy-pills': [0, 0, +25],
    'hawthorn': [-2, -2, 0],
    'meat': [-3, -5, 0],
    'roasted-meat': [15, 15, 20],
    'pepper': [-4, -2, 0],
    'roasted-pepper': [-5, -5, -5],
    'physalis': [-2, -2, 0],
    'pumpkin': [-10, -10, -10],
    'roasted-pumpkin': [-5, -5, -5],
    'rosehip': [-2, -2, 0],
    'mushroom-1': [-2, -2, 0],
    'mushroom-2': [-4, -3, 0],
    'roasted-mushroom': [1, 1, 1],
    'snack-1': [20, 0, 25],
    'snack-2': [20, 0, 25],
    'tomato': [-2, -4, -3]
  },
  'treehugger': {
    'acorn': [2, 0, 0],
    'bread-1': [-15, 0, -10],
    'bread-2': [-20, 0, -10],
    'carrot': [4, 2, 0],
    'drink-1': [0, 0, 0],
    'drink-2': [0, 0, 0],
    'drink-3': [-3, -10, -3],
    'drink-4': [-3, -10, -3],
    'drink-5': [-5, -10, -5],
    'fruit-1': [3, 5, 5],
    'fruit-2': [3, 5, 5],
    'fruit-3': [3, 5, 5],
    'energy-pills': [0, 0, -25],
    'hawthorn': [3, 5, 3],
    'meat': [3, 3, 5],
    'roasted-meat': [10, 5, 10],
    'pepper': [5, 5, 5],
    'roasted-pepper': [5, 5, 5],
    'physalis': [2, 3, 2],
    'pumpkin': [5, 5, 10],
    'roasted-pumpkin': [4, 3, 4],
    'rosehip': [2, 2, 4],
    'mushroom-1': [2, 2, 4],
    'mushroom-2': [2, 2, 4],
    'roasted-mushroom': [2, 3, 5],
    'snack-1': [-15, 0, -8],
    'snack-2': [-15, 0, -8],
    'tomato': [4, 5, 7]
  }
}

const actionTextMapping = {
  'break-door': 'breaking',
  'search': 'searching',
  'scout-area': 'scouting',
  'rest': 'resting',
  'sleep': 'sleeping',
  'smash-window': 'smashing',
  'gather': 'gathering',
  'read': 'reading',
  'drink': 'drinking',
  'fish': 'fishing',
  'cook': 'cooking',
  'attack': 'attacking',
  'lure': 'luring',
  'craft': 'crafting',
  'cut-down': 'cutting',
  'equip': 'equipping'  
}

export default {
  
  init: function() {
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
    new Binding({
      object: game,
      property: 'character',
      element: document.getElementById('character').querySelector('.slot-hero h2')
    })
  },

  hourlyTasks: function(hour) {
    if (hour === 21) {
      this.setGameProp('timeMode', 'night');
    }
    if (hour === 5) {
      this.setGameProp('timeMode', 'day');
    }
  },

  /* ==================== the good ones ==================== */

  preloadBuidlings: function() {
    let images = [];
    for (const prop in buildingProps) {
      images[i] = new Image();
      if (prop.startsWith('signpost-')) {
        images[i].src = './img/buildings/signpost.png';
      } else if (prop === 'small-tree') {
        images[i].src = './img/buildings/small-tree-1.png';
        images[i] = new Image();
        images[i].src = './img/buildings/small-tree-2.png';
      } else if (prop === 'big-tree') {
        images[i].src = './img/buildings/big-tree-1.png';
        images[i] = new Image();
        images[i].src = './img/buildings/big-tree-2.png';
      } else {
        images[i].src = './img/buildings/' + prop + '.png';
      }
    };
  },

  preloadItems: function() {
    let images = [];
    for (const prop in items) {
      images[i] = new Image();
      if (items[prop][0] !== 'extra') {
        images[i].src = './img/items/'+prop+'.PNG';
      } else {
        images[i].src = './img/weapons/'+prop+'.png';
      }
    };
  },

  preloadUI: function() {
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

  preloadZombies: function() {
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

  modifyObjectProperties: function() {
    if (this.getGameProp('character') === 'treehugger') {
      buildingActions['tree'][3] = 'rest|60|+20';
      buildingActions['house'][3] = 'rest|60|+10';
      buildingActions['house'][4] = 'sleep|120|+30';
      buildingActions['car'][3] = 'rest|60|+10';
    }
  },

  saveCheckpoint: function(targetLocationName, playerPosition, playerStats) {
    let saveCheckpoint = {
      targetLocationName: targetLocationName,
      gameTime: window.timeIsUnity,
      playerCharacter: this.getGameProp('character'),
      playerPosition: playerPosition,
      playerStats: playerStats,
      inventoryItems: {}
    }
    // https://stackoverflow.com/questions/29585812/json-stringify-does-not-stringify-nested-arrays
    for (let item in inventory.items) {
      if (inventory.items[item].amount && inventory.items[item].amount > 0) {
        saveCheckpoint.inventoryItems[item] = inventory.items[item];
      }
    }
    localStorage.setItem("saveCheckpoint", JSON.stringify(saveCheckpoint));
    document.getElementById('actions').querySelector('li.mixed .game-saved').classList.add('active');
    window.setTimeout(() => {
      document.getElementById('actions').querySelector('li.mixed .game-saved').classList.remove('active');
    }, 2000);
  },

  getGameProp: function(prop) {
    return game[prop];
  },

  setGameProp: function(prop, value) {
    game[prop] = value;
  },

  pauseGame: function(pause) {
    this.setGameProp('gamePaused', pause);
    if (pause) {
      document.body.classList.add('is--paused');
    } else {
      document.body.classList.remove('is--paused');
    }
  },

  /* inventory */
  getAllItems: function() {
    return items;
  },

  getItem: function(item) {
    return items[item];
  },

  getItemModifier: function(type, item) {
    // returns item modifiers for [hunger, thirst, energy]
    if (itemModifiers[type]) {
      return itemModifiers[type][item];
    }
  },

  extractItemName: function(item) {
    return item.replace('-', ' ').replace(' 1-2', '').replace(' 1', '').replace(' 2', '').replace(' 3', '').replace(' 4', '');
  },

  /* active crafting number */
  getCrafting: function() {
    return crafting;
  },

  getCookingRecipes: function() {
    return cookingRecipes;
  },

  getCraftingRecipes: function() {
    return craftingRecipes;
  },

  getObjectIdsAt: function(x, y) {
    if (objectIdsAt[x] !== undefined) {
      return objectIdsAt[x][y];
    }
  },

  getObjectsAt: function(x, y) {
    let allObjectsAt = [];
    this.getObjectIdsAt(x, y)?.forEach(id => {
      allObjectsAt.push(this.getObject(id));
    });
    return allObjectsAt;
  },

  addObjectIdAt: function(x, y) {
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
  
  getObject: function(id) {
    return objects[id];
  },

  setObject: function(id, data) {
    objects[id] = data;
  },

  getAllPaths: function() {
    return paths;
  },

  getAllTargetLocations: function() {
    return targetLocations;
  },
  
  getInventory: function() {
    return inventory;
  },

  getInventoryPresets: function(character) {
    return inventoryPresets[character];
  },
  
  addWeaponToInventory: function(item, addAmount, setWeaponProps) {
    const amount = parseInt(addAmount),
          setDamage = setWeaponProps.damage,
          setProtection = setWeaponProps.protection,
          setDurability = setWeaponProps.durability,
          itemProps = items[item];

    if (inventory.items[item] !== undefined) {
      // weapon was added to inventory before
      inventory.items[item].amount += amount;
      inventory.items[item].amount < 0 ? inventory.items[item].amount = 0 : false;
      
      setDamage ? inventory.items[item].damage = setDamage : false;
      setProtection ? inventory.items[item].protection = setProtection : false;

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
        durability: setDurability
      }
    } else {
      console.log('adding weapon "' + item + '" to inventory failed');
    }
    this.calcTotalInventoryItems();
  },
  
  addItemToInventory: function(item, addAmount) {
    const amount = parseInt(addAmount),
          itemProps = items[item];

    if (inventory.items[item] !== undefined) {
      // item was added to inventory before
      inventory.items[item].amount += amount;
      inventory.items[item].amount < 0 ? inventory.items[item].amount = 0 : false;
    } else if (itemProps !== undefined) {
      // item is added first time to inventory
      inventory.items[item] = {
        type: itemProps[0],
        name: item,
        amount: amount
      }
    } else {
      console.log('adding item "' + item + '" to inventory failed');
    }
    this.calcTotalInventoryItems();        
  },

  calcTotalInventoryItems: function() {
    inventory.itemNumbers = 0;
    for (let item in inventory.items) {
      if (inventory.items[item].type !== 'extra' && inventory.items[item].amount && inventory.items[item].amount > 0) {
        inventory.itemNumbers += inventory.items[item].amount;
      }
    }
  },

  calcItemProps: function(item) {
    const itemProps = this.getItem(item);
    const itemMods = this.getItemModifier(this.getGameProp('character'), item);
    if (itemProps) {
      return {
        type: itemProps[0],
        damage: this.calcItemDamage(item),
        protection: this.calcItemProtection(item),
        food: itemMods !== undefined ? itemProps[1] + itemMods[0] : itemProps[1],
        drink: itemMods !== undefined ? itemProps[2] + itemMods[1] : itemProps[2],
        energy: itemMods !== undefined ? itemProps[3] + itemMods[2] : itemProps[3]
      }
    } else {
      console.log('No props for item ' + item);
    }
  },
  
  calcItemDamage: function(item) {
    const itemProps = items[item];
    return itemProps[4] ? itemProps[4] : 1 + Math.round(itemProps[3] / 10);
  },
  
  calcItemProtection: function(item) {
    const itemProps = items[item];
    if (itemProps[5]) {
      return itemProps[5];
    } else {
      return itemProps[1] > itemProps[2] ? Math.round(itemProps[1] / 10) : Math.round(itemProps[2] / 10);
    }
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
    this.setupBuilding(17, 43, ['big-tree'], ['stone', 'branch']);
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
    this.setupBuilding(14, 16, ['small-tree', 'big-tree']);
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
    //this.setZedAt(16, 38, 1);
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
    // HORDE 2 (5 should be painfully enough)
    this.setZedAt(34, 17, 1);
    this.setZedAt(35, 17, 2);
    this.setZedAt(36, 17, 1);
    this.setZedAt(35, 18, 1);
  },

  getLootBuildingProbability: function(buildingName) {
    // returns [firstItemChance, nextItemsChance]
    const type = this.getBuildingTypeOf(buildingName);

    if (buildingName === 'crate') {
      return [11, 0];
    }
    // house, car, farm, tree, church, train, shop, industrial, water, camping, corpse
    if (this.getGameProp('character') === 'treehugger') {
      if (type === 'house' || type === 'car' || type === 'train' || type === 'shop' || type === 'industrial') {
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
      if (type === 'industrial' || type === 'car' || type === 'train' || buildingName === 'basement') {
        return [11, 8];
      }
    } else if (this.getGameProp('character') === 'cashmeister') {
      return [7, 3];
    }
    // defaults
    return [9, 6];
  },

  forceLootItemList: function(forceItems, maxAmount) {
    let lootItemList = [];
    for (var i = 0; i < forceItems.length; i += 1) {
      lootItemList.push({
        name: JSON.parse(JSON.stringify(forceItems[i])),
        amount: Math.round(Math.random() * maxAmount) || 1
      });
    }
    return lootItemList;
  },

  createLootItemList: function(spawn, allItems, allProbabilities, amount) {
    const maxAmount = amount || 1;
    let lootItemList = [];
    let probability = allProbabilities[0];
    
    for (var i = 0; i < spawn; i += 1) {
      let randomItem = Math.floor(Math.random() * allItems.length);
      if ((Math.random() * 10) < probability) {
        lootItemList.push({
          name: JSON.parse(JSON.stringify(allItems[randomItem])),
          amount: Math.round(Math.random() * maxAmount) || 1
        });
        probability = allProbabilities[1];
      } else {
        lootItemList.push({
          name: JSON.parse(JSON.stringify(allItems[randomItem])),
          amount: 0
        });        
      }
      allItems.splice(randomItem, 1);
    }
    return lootItemList;
  },

  setupBuilding: function(x, y, buildingNamesArray, forceItems, forceInfested) {
    buildingNamesArray.forEach(buildingName => {
      const props = buildingProps[buildingName];
      const lootItemList = forceItems ? this.forceLootItemList(forceItems, props.amount) : this.createLootItemList(props.spawn, JSON.parse(JSON.stringify(props.items)), this.getLootBuildingProbability(buildingName, true), props.amount);
      const locked = (Math.random() * props.locked > 1) ? true : false;
      const type = this.getBuildingTypeOf(buildingName);
      const infested = (type === 'house' && (Math.random() < 0.5)) ? true : false;

      const currentObjectsIdCounter = this.addObjectIdAt(x, y);
      this.setObject(currentObjectsIdCounter, {
        x: x,
        y: y,
        name: buildingName,
        title: buildingName.startsWith('signpost-') ? 'signpost' : buildingName.replace('-1', '').replace('-2', '').replace('-', ' '),
        type: type,
        group: 'building',
        text: false,
        actions: this.getBuildingActionsFor(buildingName, locked, infested),
        items: lootItemList,
        locked: locked,
        looted: false,
        infested: forceInfested || infested,
        zednearby: null,
        active: true,
        inreach: false,
        discovered: false,
        distance: null,
        attack: undefined,
        defense: undefined, // use later for building cards in battle
        dead: undefined,
        disabled: false,
        removed: false
      });
    });
  },

  setZedAt: function(x, y, amount) {
    for (var i = 0; i < amount; i += 1) {
      let attack = Math.floor(Math.random()*6+4);
      let lootItemList = this.createLootItemList(3, ['fail', 'hacksaw', 'knife', 'mallet', 'pincers', 'spanner', 'tape', 'snack-1', 'drink-1', 'nails'], [10, attack >= 10 ? 9 : 5]);
      let name = 'zombie-' + zedCounter;

      zedCounter += 1;
      zedCounter > 3 ? zedCounter = 1 : false;

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
          { id: 'search', label: 'Search', time: 20, energy: -5 }
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
        defense: Math.floor(Math.random()*10+6),
        dead: false,
        fighting: false,
        disabled: false,
        removed: false
      });  
    }
  },

  setRatAt: function(x, y) {
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
        { id: 'cut', label: 'Cut', time: 20, energy: -15 }
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
      attack: Math.floor(Math.random()*3+1),
      defense: Math.floor(Math.random()*4+2),
      dead: false,
      fighting: false,
      disabled: false,
      removed: false
    });  
  },

  spawnRatsAt: function(x, y) {
    const amount = Math.round(Math.random() * 5) || 3;
    let spawnedRatIds = [];
    for (var i = 0; i < amount; i += 1) {
      this.setRatAt(x, y);
      spawnedRatIds.push(objectsIdCounter - 1); // at this place the countor is one ahead
    }
    return spawnedRatIds;
  },

  spawnAnimalAt: function(name, x, y) {
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
        { id: 'cut', label: 'Cut', time: 20, energy: -15 }
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
      removed: false
    });  
  },

  setupWeapon: function(x, y, weaponName, forceStats) {
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
      actions: props.preview ? [{ id: 'got-it', label: 'Got it!' }] : [{ id: 'equip', label: 'Equip' }],
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
      removed: false
    });
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

  getWeaponProps: function(itemName) {
    if (itemName) {
      return weaponProps[itemName];
    } else {
      return weaponProps;
    }
  },

  getWeaponPropsUpgrades: function(itemName) {
    if (itemName) {
      return weaponPropsUpgrades[itemName];
    } else {
      return weaponPropsUpgrades;
    }
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

  mapActionsToText: function(action) {
    return actionTextMapping[action];
  },
    
  getBuildingActionsFor: function(buildingName, locked, infested) {
    const buildingType = this.getBuildingTypeOf(buildingName);
    const actions = buildingActions[buildingType];
    let actionSet = [];
    // adding actions for certain character <-> building combos
    if (buildingName === 'fireplace') {
      if (this.getGameProp('character') !== 'craftsmaniac' && this.getGameProp('character') !== 'cashmeister') actionSet.push({id: 'cook', label: 'cook', time: 30});
      if (this.getGameProp('character') === 'treehugger') actionSet.push({id: 'sleep', label: 'sleep', time: 120, energy: 60});
    }
    if (actions !== undefined) {
      actions.forEach(action => {
        let singleAction = {};
        singleAction.name = action.split("|")[0]; // old
        singleAction.label = action.split("|")[0]; // new
        singleAction.id = action.split("|")[0].replaceAll(' ', '-'); // new
        if ((buildingName === 'pump' && singleAction.id === 'fish') ||
            (buildingName === 'outhouse' && singleAction.id === 'break-door') ||
            (buildingName === 'small-tree' && singleAction.id === 'rest') ||
            (buildingName === 'big-tree' && singleAction.id === 'cut-down') ||
            (buildingName === 'fireplace' && singleAction.id === 'break-door') ||
            (buildingName === 'fireplace' && singleAction.id === 'scout-area') ||
            (buildingName === 'fireplace' && singleAction.id === 'search') ||
            (buildingName === 'seating' && singleAction.id === 'break-door') ||
            (buildingName === 'seating' && singleAction.id === 'scout-area') ||
            (buildingName === 'seating' && singleAction.id === 'sleep') ||
            (buildingName === 'well' && singleAction.id === 'fish')) {
          // these are exceptions for certain building <-> action combos that make no sense
        } else if ((!locked && singleAction.id === 'smash-window') ||
                   (!locked && singleAction.id === 'break-door')) {
          // these are exceptions for certain stats <-> action combos that make no sense
        } else if (this.getGameProp('character') === 'snackivore' &&  singleAction.id === 'drink' ||
                   this.getGameProp('character') === 'furbuddy' &&  singleAction.id === 'cut') {
          // removing actions for certain character <-> building combos
          // see fireplace above for craftsmaniac/cooking
        } else {
          singleAction.time = parseInt(action.split("|")[1]);
          singleAction.energy = parseInt(action.split("|")[2] || 0);
          actionSet.push(singleAction);
        }

        if (singleAction.id === 'gather' ||
            singleAction.id === 'search' ||
            singleAction.id === 'rest' ||
            singleAction.id === 'sleep' ||
            singleAction.id === 'cut-down' ||
            singleAction.id === 'cook' ||
            singleAction.id === 'drink' ||
            singleAction.id === 'read') {
          singleAction.needsUnlock = true;
        } else {
          singleAction.needsUnlock = false;
        }
        if (infested && singleAction.id === 'search') {
          singleAction.critical = true;
        }
        singleAction.locked = undefined;
      });
    }
    return actionSet;
  }
}
