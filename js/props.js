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
  timeMode: 'day',
  tutorial: false,
  battle: false,
  gamePaused: true,
  local: location.href.startsWith('http://127'),
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
  firstDeadAnimal: false
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

var buildingTypes = {
  'house': ['house', 'barn', 'cottage', 'old-villa', 'farm-house', 'town-house'],
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
  'camping': ['seating', 'log-cabine', 'outhouse', 'fireplace'],
  'corpse': ['human-corpse-1']
};

var buildingProps = {
  'barn': { locked: 1.2, spawn: 2, items: ['claw', 'duck', 'straw-wheet', 'pumpkin'] },
  'big-tree': { locked: 0, spawn: 3, items: ['acorn', 'branch', 'fruit-1', 'fruit-2', 'fruit-3', 'mushroom-1', 'stone'], amount: 2 },
  'outhouse': { locked: 0, spawn: 1, items: ['exodus', 'acorn', 'hawthorn', 'rosehip', 'straw-wheet'] },
  'pump': { locked: 0, spawn: 1, items: ['branch', 'physalis', 'reef', 'spanner'] },
  'house': { locked: 2, spawn: 3, items: ['bread-1', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-5', 'exodus', 'cloth'] },
  'farm-house': { locked: 2, spawn: 3, items: ['bread-2', 'wine', 'pumpkin', 'carrot', 'knife', 'pepper', 'tomato', 'exodus'] },
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
  'scarecrow': { locked: 0, spawn: 1, items: ['straw-wheet', 'straw-wheet', 'pumpkin'], amount: 2 },
  'small-tree': { locked: 0, spawn: 2, items: ['branch', 'hawthorn', 'physalis', 'rosehip', 'mushroom-1', 'stone', 'straw-wheet'] },
  'church': { locked: 2, spawn: 3, items: ['books', 'wine', 'bread-2'] },
  'milton': { locked: 0, spawn: 0, items: [] },
  'sobor': { locked: 0, spawn: 0, items: [] },
  'train-wreck-2': { locked: 0, spawn: 2, items: ['energy-pills', 'pincers', 'spanner'] },
  'train-wreck-1': { locked: 0, spawn: 3, items: ['snack-1', 'snack-2', 'drink-2', 'drink-5', 'wine'] },
  'market': { locked: 2, spawn: 3, items: ['bread-1', 'bread-2', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-3', 'drink-4', 'exodus'] },
  'gas-station': { locked: 2, spawn: 3, items: ['bread-1', 'bread-2', 'wine', 'snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-1', 'exodus'] },
  'tool-shed': { locked: 2, spawn: 2, items: ['cloth', 'claw', 'fail', 'hacksaw', 'exodus', 'knife', 'mallet', 'pincers', 'spanner', 'tape'] },
  'garage': { locked: 3, spawn: 3, items: ['cloth', 'claw', 'fail', 'hacksaw', 'exodus', 'knife', 'mallet', 'pincers', 'spanner', 'tape'] },
  'well': { locked: 0, spawn: 1, items: ['branch', 'rosehip', 'reef', 'stone'], amount: 2 },
  'jetty': { locked: 0, spawn: 1, items: ['reef', 'rosehip', 'stone', 'duck'], amount: 2 },
  'seating': { locked: 0, spawn: 1, items: ['drink-1', 'drink-2', 'snack-1', 'snack-2'] },
  'log-cabine': { locked: 1.4, spawn: 2, items: ['stump', 'straw-wheet', 'branch', 'drink-3', 'drink-4', 'snack-1', 'snack-2'] },
  'cottage': { locked: 2, spawn: 3, items: ['bread-2', 'wine', 'snack-1', 'snack-2', 'knife', 'drink-2', 'drink-5', 'exodus'] },
  'fireplace': { locked: 0, spawn: 0, items: [] },
  'human-corpse-1': { locked: 0, spawn: 3, items: ['wine', 'snack-1', 'snack-2', 'knife', 'drink-2', 'drink-5', 'exodus', 'cloth', 'wooden-club'] },
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
  'corpse': ['search|15|-5']
};

var cookingRecipes = {
  'roasted-meat': [ 'meat','sharp-stick', 1, 'roast' ],
  'roasted-pepper': [ 'pepper','sharp-stick', 1, 'roast' ],
  'roasted-mushroom': [ 'mushroom-1-2','sharp-stick', 1, 'roast' ],
  'roasted-pumpkin': [ 'pumpkin','knife', 4, 'roast' ],
  'glue': [ 'bones','drink-1-2', 1, 'cook' ],
};

var weaponProps = {
  /*'axe': [0, 8],
  'baseball-bat': [25, 4],
  'hammer': [0, 5],
  'saw': [0, 1],
  'wooden-club': [25, 2],
  'wrench': [0, 7]*/
  'improvised-axe': {attack: 8, defense: 4, durability: 3},
  'wooden-club': {attack: 6, defense: 3, durability: 3}
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
  '18-40': {
    title: 'Zombies!',
    text: 'The road in front of you is blocked. Two unfortunates "survived" this accident, and now walk around as undead. They are really dangerous – better deal with them later.'
  },
  '17-40': {
    title: 'Zombie 101',
    text: 'Try to lure single Zeds towards you. Attacking them will cause other Zeds in the area join the fight. When you walk right into them, they  will attack you first.'
  },
  '30-7': {
    title: 'You found it!',
    text: 'After all the hardships you made it to the ship in time! You take your beloved in your arms and together you look over the devastated land while the ship is heading towards a hopefully safe future.',
    showAlways: true
  },
  '18-29': {
    title: 'The Horde!',
    text: 'You see a huge horde of Zombies slowly shambling across the street. At this speed it will take days before they are gone. You better turn around and search for an alternative route!',
    showAlways: true
  },
};

var specialEvents = {
  'infestation': {
    title: 'Infestation',
    text: 'The building is invested by giant rats! Scout the place before searching to avoid an immediate confrontation.<br><img src="./img/card/status-infested.png">'
  },
  'locked-building': {
    title: 'Locked Building',
    text: 'The building is locked. You need an axe to break the door.<br><img src="./img/card/status-locked.png">'
  },
  'locked-car': {
    title: 'Locked Car',
    text: 'The owners of the car left it locked. You need to smash the windows with an axe or stone to get in.<br><img src="./img/card/status-locked.png">'
  },
  'hostiles-nearby': {
    title: 'Hostiles nearby',
    text: 'You won\'t be able to enter many place until you\'ve taken care of all hostiles nearby.<br><img src="./img/card/status-zombies.png">'
  },
  'crafting': {
    title: 'Crafting',
    text: 'You collected the right resources to craft an Improvised Axe. The Axe is an extremely versatile, useful tool and weapon.<br><br><img src="./img/actions/craft.png">'
  },
  'corpse': {
    title: 'Blessing in disguise',
    text: 'Not all were rising back from the dead.<br>When chaos broke out, those few who were lucky enough not to have been infected before dying, just stayed dead.'
  },
  'rat-fight': {
    title: 'Taking a bite',
    text: 'When a rat attacks, it will steal food from your inventory to improve its defense. When there is no food left, it will attack you instead.'
  },
  'dead-animal': {
    title: 'Bon Appétit',
    text: 'Dead animals give some good meal, when being cutted into pieces and roasted over a fireplace. Just get over the disgust.<br><img src="./img/items/meat.PNG">'
  },
  'low-energy': {
    title: 'Worn-out',
    text: 'Most actions consume a certain amount of Energy. Make sure to eat high-quality food and find a place to rest or sleep. At night you get a bonus.<br><img class="double" src="./img/icons/energy.png">'
  }
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
  'stone': ['craft', 0, 0, 0, 4, 1],
  'straw-wheet': ['craft', 0, 0, 0, 0, 0],
  'stump': ['craft', 0, 0, 0, 3, 3],
  'tape': ['craft', 0, 0, 0, 1, 0],
  'tomato': ['eat', 4, 8, 3],
  'wine': ['drink', 5, 35, 20],
  'improvised-axe': ['extra', 0, 0, 0, 8, 4],
  'wooden-club': ['extra', 0, 0, 0, 6, 3]
};

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

  getGameProp: function(prop) {
    return game[prop];
  },
  setGameProp: function(prop, value) {
    game[prop] = value;
  },

  /* inventory */
  getAllItems: function() {
    return items;
  },

  /* active crafting number */
  getCrafting: function() {
    return crafting;
  },

  getCookingRecipes: function() {
    return cookingRecipes;
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

  addObjectIdAt: function(id, x, y) {
    if (objectIdsAt[x][y] !== undefined) {
      objectIdsAt[x][y].push(id);
    } else {
      objectIdsAt[x][y] = [];
      objectIdsAt[x][y].push(id);
    }
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
  
  addToInventory: function(item, amount, durability) {
    amount = parseInt(amount);
    const itemProps = items[item];
    if (inventory.items[item] !== undefined) {
      inventory.items[item].amount += amount;
      inventory.items[item].amount < 0 ? inventory.items[item].amount = 0 : false;
      if (durability !== undefined) {
        inventory.items[item].durability += durability;
        if (inventory.items[item].durability === 0) { inventory.items[item].amount = 0 }
      }
    } else {
      inventory.items[item] = {
        type: itemProps[0],
        name: item,
        amount: amount,
        damage: itemProps[4] ? itemProps[4] : 1 + Math.round(itemProps[3] / 10),
        durability: durability
      }
      if (itemProps[5]) {
        inventory.items[item].protection = itemProps[5];
      } else {
        inventory.items[item].protection = itemProps[1] > itemProps[2] ? Math.round(itemProps[1] / 10) : Math.round(itemProps[2] / 10);
      }
    }
    inventory.itemNumbers = 0;
    for (item in inventory.items) {
      if (inventory.items[item].amount && inventory.items[item].amount > 0) {
        inventory.itemNumbers += inventory.items[item].amount;
      }
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

  createLootItemList: function(spawn, allItems, probability, amount) {
    const maxAmount = amount || 1;
    let lootItemList = [];
    for (var i = 0; i < spawn; i += 1) {
      let randomItem = Math.floor(Math.random() * allItems.length);
      if ((Math.random() * 10) < probability) {
        lootItemList.push({
          name: JSON.parse(JSON.stringify(allItems[randomItem])),
          amount: Math.round(Math.random() * maxAmount) || 1
        });
        probability = 6;
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

  setupBuilding: function(x, y, buildingNamesArray, forceItems) {
    buildingNamesArray.forEach(buildingName => {
      const props = buildingProps[buildingName];
      const lootItemList = forceItems ? this.forceLootItemList(forceItems, props.amount) : this.createLootItemList(props.spawn, JSON.parse(JSON.stringify(props.items)), 9, props.amount);
      const locked = (Math.random() * props.locked > 1) ? true : false;
      const type = this.getBuildingTypeOf(buildingName);
      const infested = (type === 'house' && (Math.random() < 0.5)) ? true : false;

      this.addObjectIdAt(objectsIdCounter, x, y);
      this.setObject(objectsIdCounter, {
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
        infested: infested,
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
      objectsIdCounter += 1;
    });
  },

  setZedAt: function(x, y, amount) {
    for (var i = 0; i < amount; i += 1) {
      let lootItemList = this.createLootItemList(3, ['fail', 'hacksaw', 'knife', 'mallet', 'pincers', 'spanner', 'tape', 'snack-1', 'drink-1'], 10);
      let name = 'zombie-' + zedCounter;

      zedCounter += 1;
      zedCounter > 3 ? zedCounter = 1 : false;

      this.addObjectIdAt(objectsIdCounter, x, y);
      this.setObject(objectsIdCounter, {
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
        attack: Math.floor(Math.random()*6+4),
        defense: Math.floor(Math.random()*10+6),
        dead: false,
        fighting: false,
        disabled: false,
        removed: false
      });  
      objectsIdCounter += 1;
    }
  },

  setRatAt: function(x, y) {
    let lootItemList = this.createLootItemList(2, ['meat', 'bones'], 11, 2);
    let name = 'rat';

    this.addObjectIdAt(objectsIdCounter, x, y);
    this.setObject(objectsIdCounter, {
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
      spawnedRatIds.push(objectsIdCounter);
      objectsIdCounter += 1;
    }
    return spawnedRatIds;
  },

  spawnAnimalAt: function(name, x, y) {
    let lootItemList = this.createLootItemList(2, ['meat', 'bones'], 11, 3);
    this.addObjectIdAt(objectsIdCounter, x, y);
    this.setObject(objectsIdCounter, {
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
    objectsIdCounter += 1;
  },

  setupAllEvents: function() {
    for (var event in events) {
      if (this.getGameProp('tutorial') || events[event].showAlways) {
        const x = event.split('-')[0];
        const y = event.split('-')[1];
        this.addObjectIdAt(objectsIdCounter, x, y);
        this.setObject(objectsIdCounter, {
          x: x,
          y: y,
          name: 'event',
          title: events[event].title,
          type: undefined,
          group: 'event',
          text: events[event].text,
          actions: [{
            id: 'got-it', label: 'Got it!'
          }],
          items: [],
          active: true,
          discovered: false,
          removed: false
        });  
        objectsIdCounter += 1;  
      }
    };
  },

  setupSpecialEvent: function(event, x, y) {
    if (this.getGameProp('tutorial')) {
      this.addObjectIdAt(objectsIdCounter, x, y);
      this.setObject(objectsIdCounter, {
        x: x,
        y: y,
        name: 'event',
        title: specialEvents[event].title,
        type: undefined,
        group: 'event',
        text: specialEvents[event].text,
        actions: [{
          id: 'got-it', label: 'Got it!'
        }],
        items: [],
        active: true,
        discovered: false,
        removed: false
      });  
      objectsIdCounter += 1;  
      return objectsIdCounter - 1;
    }
  },

  setupWeapon: function(x, y, weaponName) {
    let props = weaponProps[weaponName];
    this.addObjectIdAt(objectsIdCounter, x, y);
    this.setObject(objectsIdCounter, {
      x: x,
      y: y,
      name: weaponName,
      title: weaponName.replace('-', ' '),
      type: undefined,
      group: 'weapon',
      text: false,
      actions: [{
        id: 'equip', label: 'Equip'
      }],
      items: [],
      locked: undefined,
      looted: false,
      zednearby: null,
      active: true,
      inreach: false,
      discovered: false,
      distance: null,
      attack: props.attack,
      defense: props.defense,
      durability: props.durability,
      dead: undefined,
      disabled: false,
      removed: false
    });
    objectsIdCounter += 1;
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

  getWeaponProps: function() {
    return weaponProps;
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
    if (buildingName === 'fireplace') actionSet.push({id: 'cook', label: 'cook', time: 30});
    if (actions !== undefined) {
      actions.forEach(action => {
        let singleAction = {};
        singleAction.name = action.split("|")[0]; // old
        singleAction.label = action.split("|")[0]; // new
        singleAction.id = action.split("|")[0].replaceAll(' ', '-'); // new
        if ((buildingName === 'pump' && singleAction.id === 'fish') ||
            (buildingName === 'pump' && singleAction.id === 'gather') ||
            (buildingName === 'outhouse' && singleAction.id === 'break-door') ||
            (buildingName === 'small-tree' && singleAction.id === 'rest') ||
            (buildingName === 'big-tree' && singleAction.id === 'cut-down') ||
            (buildingName === 'fireplace' && singleAction.id === 'break-door') ||
            (buildingName === 'fireplace' && singleAction.id === 'scout-area') ||
            (buildingName === 'fireplace' && singleAction.id === 'search') ||
            (buildingName === 'seating' && singleAction.id === 'break-door') ||
            (buildingName === 'seating' && singleAction.id === 'scout-area') ||
            (buildingName === 'seating' && singleAction.id === 'sleep') ||
            (buildingName === 'well' && singleAction.id === 'gather') ||
            (buildingName === 'well' && singleAction.id === 'fish')) {
          // these are exceptions for certain building <-> action combos that make no sense
        } else if ((!locked && singleAction.id === 'smash-window') ||
                   (!locked && singleAction.id === 'break-door')) {
          // these are exceptions for certain stats <-> action combos that make no sense
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
