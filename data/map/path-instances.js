/**
 * Path instances for all maps
 * @typedef {Object} PathCoords
 * @property {number} x - X coordinate for single point paths
 * @property {number} y - Y coordinate for single point paths
 * @property {number} x1 - X coordinate for line start
 * @property {number} y1 - Y coordinate for line start
 * @property {number} x2 - X coordinate for line end
 * @property {number} y2 - Y coordinate for line end
 * @export
 */

/**
 * @typedef {Object} PathInstances
 * @property {Array<PathCoords>} vertical - Array of vertical paths with x coordinate and y range
 * @property {Array<PathCoords>} horizontal - Array of horizontal paths with y coordinate and x range
 * @property {Array<PathCoords>} diagonalDown - Array of diagonal down paths with y coordinate and x range
 * @property {Array<PathCoords>} diagonalUp - Array of diagonal up paths with y coordinate and x range
 * @property {Array<PathCoords>} single - Array of single path coordinates
 * @property {Array<PathCoords>} remove - Array of path coordinates to remove (no path)
 * @export
 */

/** @type {Record<string, PathInstances>} */
export default {
  start: {
    // Vertical paths
    vertical: [
      { x: 18, y1: 2, y2: 44 },
      { x: 13, y1: 8, y2: 9 },
      { x: 28, y1: 22, y2: 29 },
      { x: 41, y1: 26, y2: 33 },
      { x: 35, y1: 14, y2: 17 },
      { x: 7, y1: 14, y2: 16 },
      { x: 7, y1: 34, y2: 38 },
      { x: 35, y1: 31, y2: 43 },
    ],
    // Horizontal paths
    horizontal: [
      { x1: 16, x2: 19, y: 3 },
      { x1: 19, x2: 23, y: 37 },
      { x1: 15, x2: 17, y: 15 },
      { x1: 25, x2: 35, y: 37 },
      { x1: 9, x2: 17, y: 10 },
      { x1: 16, x2: 19, y: 8 },
      { x1: 21, x2: 26, y: 5 },
      { x1: 19, x2: 22, y: 14 },
      { x1: 12, x2: 17, y: 21 },
      { x1: 9, x2: 17, y: 32 },
      { x1: 28, x2: 43, y: 30 },
      { x1: 13, x2: 17, y: 41 },
      { x1: 32, x2: 36, y: 41 },
    ],
    // Diagonal down paths
    diagonalDown: [
      { x1: 8, x2: 11, y: 17 },
      { x1: 19, x2: 24, y: 31 },
      { x1: 4, x2: 12, y: 36 },
      { x1: 28, x2: 32, y: 32 },
      { x1: 27, x2: 34, y: 6 },
      { x1: 26, x2: 27, y: 20 },
      { x1: 30, x2: 32, y: 7 },
    ],
    // Diagonal up paths
    diagonalUp: [
      { x1: 8, x2: 10, y: 13 },
      { x1: 29, x2: 34, y: 23 },
    ],
    // Fill gaps - single points
    single: [
      { x: 31, y: 9 },
      { x: 8, y: 33 },
      { x: 29, y: 31 },
      { x: 12, y: 42 },
      { x: 20, y: 4 },
      { x: 7, y: 8 },
      { x: 8, y: 9 },
    ],
    // Remove paths player shouldn't walk
    remove: [
      { x: 18, y: 40 },
      { x: 18, y: 11 },
      { x: 18, y: 12 },
    ],
  },
};
