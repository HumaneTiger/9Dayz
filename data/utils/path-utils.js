// @ts-check
import { MapDefinitions } from '../definitions/index.js';

export default {
  /**
   * @param {number} x
   * @param {number} y
   */
  setupPath: function (x, y) {
    MapDefinitions.paths[x][y] = true;
  },

  /**
   * @param {number} x
   * @param {number} y1
   * @param {number} y2
   */
  setupPathVer: function (x, y1, y2) {
    for (var vert = y1; vert <= y2; vert += 1) {
      MapDefinitions.paths[x][vert] = true;
    }
  },

  /**
   * @param {number} x1
   * @param {number} x2
   * @param {number} y
   */
  setupPathHor: function (x1, x2, y) {
    for (var hor = x1; hor <= x2; hor += 1) {
      MapDefinitions.paths[hor][y] = true;
    }
  },

  /**
   * @param {number} x1
   * @param {number} x2
   * @param {number} y
   */
  setupPathDiaDown: function (x1, x2, y) {
    for (var dia = 0; dia <= x2 - x1; dia += 1) {
      MapDefinitions.paths[x1 + dia][y + dia] = true;
    }
  },

  /**
   * @param {number} x1
   * @param {number} x2
   * @param {number} y
   */
  setupPathDiaUp: function (x1, x2, y) {
    for (var dia = 0; dia <= x2 - x1; dia += 1) {
      MapDefinitions.paths[x1 + dia][y - dia] = true;
    }
  },

  /**
   * @param {number} x
   * @param {number} y
   */
  removePath: function (x, y) {
    MapDefinitions.paths[x][y] = false;
  },
};
