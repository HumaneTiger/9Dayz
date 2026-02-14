// @ts-check
/**
 * @typedef {Object} GameAction
 * @property {string} id
 * @property {string} label
 * @property {number} [time]
 * @property {number} [energy]
 * @property {boolean} [critical]
 * @export
 */

/**
 * @typedef {Object} LootItem
 * @property {string} name
 * @property {number} amount
 * @export
 */

/**
 * @typedef {'building' | 'animal' | 'zombie' | 'event' | 'weapon'} ObjectGroup
 * @export
 */

/**
 * @typedef {'house' | 'car' | 'farm' | 'tree' | 'church' | 'signpost' | 'place' | 'train' | 'shop' | 'industrial' | 'water' | 'container' | 'collectable' | 'camping' | 'corpse' | 'rat' | 'bee'} ObjectType
 * @export
 */

/**
 * @typedef {GameObject} CreatureObject
 * @export
 */

/**
 * @typedef {Object} GameObject
 * @property {boolean} active
 * @property {Array<GameAction>} actions
 * @property {Array<GameObject>} [additionalGameObjects]
 * @property {number|undefined} [attack]
 * @property {number|undefined} [defense]
 * @property {boolean|undefined} [dead]
 * @property {boolean} disabled
 * @property {boolean} discovered
 * @property {number|null} distance
 * @property {Array<CreatureObject>} [enemies]
 * @property {boolean} fighting
 * @property {ObjectGroup} [group]
 * @property {boolean} hasKey
 * @property {number|undefined} [health]
 * @property {boolean} infested
 * @property {boolean} inreach
 * @property {Array<LootItem>} items
 * @property {number|undefined} [locked]
 * @property {boolean} looted
 * @property {boolean|undefined} [luringSuccessful]
 * @property {number|undefined} [maxHealth]
 * @property {string} [name]
 * @property {boolean} [preview]
 * @property {boolean} removed
 * @property {boolean} text
 * @property {string} title
 * @property {ObjectType} [type]
 * @property {number} [x]
 * @property {number} [y]
 * @property {null|string|number} [zednearby]
 * @export
 */

import GameState from './game-state.js';

const mapSize = GameState.getGameProp('mapSize');

/**
 * @typedef {number[]} ObjectIdList
 * @export
 */

// create 2D array with map size for object ids at positions
/** @type {ObjectIdList[][]} */
var objectIdsAt = Array.from({ length: mapSize.width }, () => new Array(mapSize.height));

/**
 * ObjectState manages the state of all game objects, including their properties and their positions on the map.
 * @type {GameObject[]}
 */
var objects = [];
var objectsIdCounter = 0;
var zedCounter = 1;

export default {
  /**
   * @param {Partial<GameObject>} [overrides={}]
   * @returns {GameObject}
   */
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
   * @param {number} x
   * @param {number} y
   * @returns {ObjectIdList|undefined}
   */
  getObjectIdsAt: function (x, y) {
    if (objectIdsAt[x]) {
      return objectIdsAt[x][y];
    }
    return undefined;
  },

  /**
   * @param {number} x
   * @param {number} y
   * @returns {GameObject[]}
   */
  getObjectsAt: function (x, y) {
    /** @type {GameObject[]} */
    let allObjectsAt = [];
    this.getObjectIdsAt(x, y)?.forEach(id => {
      allObjectsAt.push(this.getObject(id));
    });
    return allObjectsAt;
  },

  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
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

  /**
   * @param {number} id
   * @returns {GameObject}
   */
  getObject: function (id) {
    return objects[id];
  },

  /**
   * @param {number} id
   * @param {GameObject} data
   * @returns {void}
   */
  setObject: function (id, data) {
    objects[id] = data;
  },

  /**
   * @returns {GameObject[]}
   */
  getAllObjects: function () {
    return objects;
  },

  /**
   * @param {GameObject[]} newObjects
   * @returns {void}
   */
  setAllObjects: function (newObjects) {
    objects = newObjects;
  },

  /**
   * @returns {ObjectIdList[][]}
   */
  getAllObjectIdsAt: function () {
    return objectIdsAt;
  },

  /**
   * @param {ObjectIdList[][]} newObjectIdsAt
   * @returns {void}
   */
  setAllObjectIdsAt: function (newObjectIdsAt) {
    objectIdsAt = newObjectIdsAt;
  },

  /**
   * @returns {number}
   */
  getObjectsIdCounter: function () {
    return objectsIdCounter;
  },

  /**
   * @param {number} value
   * @returns {void}
   */
  setObjectsIdCounter: function (value) {
    objectsIdCounter = value;
  },

  /**
   * @returns {number}
   */
  getZedCounter: function () {
    return zedCounter;
  },

  /**
   * @param {number} value
   * @returns {void}
   */
  setZedCounter: function (value) {
    zedCounter = value;
  },
};
