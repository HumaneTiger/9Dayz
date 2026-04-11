// @ts-check
const mapSize = { width: 49, height: 45 };

/**
 * @typedef {boolean} Coordinate
 */

/**
 * @typedef {Coordinate[][]} PathGrid
 */

/**
 * @typedef {Object} MapPosition
 * @property {number} refX - The reference X coordinate for the map
 * @property {number} refY - The reference Y coordinate for the map
 * @property {number} x - The actual X coordinate of the map
 * @property {number} y - The actual Y coordinate of the map
 */
/**
 * @typedef {Object} MapCoordinate
 * @property {number} x - X coordinate for building spawn
 * @property {number} y - Y coordinate for building spawn
 */

/**
 * @typedef {Object} GameMap
 * @property {Object} mapSize - The dimensions of the map (width and height)
 * @property {PathGrid} paths - 2D array where each [x][y] is a Coordinate (boolean) representing if a path exists
 * @property {MapPosition} mapPosition - The current position of the map with reference points and actual x, y coordinates
 * @property {MapCoordinate} shipHotSpot - The position of the ship's hot spot on the map
 */

/**
 * @typedef {Object} Path
 * @property {number} x
 * @property {number} y
 */

/** @type {Record<string, GameMap>} */
export default {
  start: {
    mapSize: mapSize,
    /** @type {PathGrid} - create 2D array with map size for paths */
    paths: Array.from({ length: mapSize.width }, () => new Array(mapSize.height)),
    mapPosition: {
      refX: 12,
      refY: 33,
      x: 0,
      y: -311,
    },
    shipHotSpot: {
      x: 31,
      y: 8,
    },
  },
};
