const mapSize = { width: 49, height: 45 };

// create 2D array with map size for object ids at positions
var objectIdsAt = Array.from({ length: mapSize.width }, () => new Array(mapSize.height));

var objects = [];
var objectsIdCounter = 0;
var zedCounter = 1;

export default {
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
};
