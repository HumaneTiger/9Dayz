// @ts-check
const mapSize = { width: 49, height: 45 };

/**
 * @typedef {boolean} Coordinate
 */

/**
 * @typedef {Coordinate[][]} PathGrid
 */

/**
 * @typedef {Object} GameMap
 * @property {Object} mapSize - The dimensions of the map (width and height)
 * @property {PathGrid} paths - 2D array where each [x][y] is a Coordinate (boolean) representing if a path exists
 */

/**
 * @typedef {Object} Path
 * @property {number} x
 * @property {number} y
 */

/* create 2D array with map size for paths */
export default {
  mapSize: mapSize,
  /** @type {PathGrid} */
  paths: Array.from({ length: mapSize.width }, () => new Array(mapSize.height)),
};
