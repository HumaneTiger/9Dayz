// @ts-check

/**
 * @import { GameMap } from '../../data/definitions/map-definitions.js'
 */

import { BuildingInstances, ZombieInstances, PathInstances, PathUtils } from '../../data/index.js';
import { MapDefinitions } from '../../data/definitions/index.js';
import ObjectFactory from './object-factory.js';

/**
 * Initializes the map by setting up buildings, zombies, and paths based on imported JSON data.
 * Also modifies object properties based on the selected character's definition.
 */
export default {
  /**
   * Initializes the map with buildings
   * @returns {void}
   */
  setupAllBuildings: function () {
    // Setup all regular buildings from imported JSON
    BuildingInstances.buildings.forEach(entry => {
      ObjectFactory.setupBuilding(entry.x, entry.y, entry.buildings, entry.infested);
    });
  },

  /**
   * Initializes the map with zombies
   * @returns {void}
   */
  setupAllZeds: function () {
    // Setup all zombies from imported JSON
    ZombieInstances.zombies.forEach(entry => {
      ObjectFactory.setZedAt(entry.x, entry.y, entry.amount);
    });
  },

  /**
   * Initializes the map with paths
   * @returns {void}
   */
  setupAllPaths: function () {
    // Setup all paths from imported JSON
    PathInstances.paths.vertical.forEach(path => {
      PathUtils.setupPathVer(path.x, path.y1, path.y2);
    });
    PathInstances.paths.horizontal.forEach(path => {
      PathUtils.setupPathHor(path.x1, path.x2, path.y);
    });
    PathInstances.paths.diagonalDown.forEach(path => {
      PathUtils.setupPathDiaDown(path.x1, path.x2, path.y);
    });
    PathInstances.paths.diagonalUp.forEach(path => {
      PathUtils.setupPathDiaUp(path.x1, path.x2, path.y);
    });
    PathInstances.paths.single.forEach(path => {
      PathUtils.setupPath(path.x, path.y);
    });
    PathInstances.paths.remove.forEach(path => {
      PathUtils.removePath(path.x, path.y);
    });
  },

  /**
   * @returns {GameMap['paths']} - the 2D array representing the map's paths
   */
  getAllPaths: function () {
    return MapDefinitions.paths;
  },
};
