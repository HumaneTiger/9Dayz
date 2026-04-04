// @ts-check

/**
 * @import { GameMap, MapPosition } from '../../data/definitions/map-definitions.js'
 */

import { BuildingInstances, ZombieInstances, PathInstances, PathUtils } from '../../data/index.js';
import { MapDefinitions } from '../../data/definitions/index.js';
import ObjectFactory from './object-factory.js';

/**
 * Initializes the map by setting up buildings, zombies, and paths based on imported JSON data.
 * Also modifies object properties based on the selected character's definition.
 */
export default {
  /** @type {GameMap} */
  currentMap: MapDefinitions['start'],
  /** @type {string} */
  currentMapKey: 'start',

  /**
   * Sets the current map based on the provided map key.
   * @param {string} key - The key of the map to set as current.
   */
  setCurrentMap: function (key) {
    this.currentMap = MapDefinitions[key];
    this.currentMapKey = key;
  },

  /**
   * Initializes the map with buildings
   * @returns {void}
   */
  setupAllBuildings: function () {
    // Setup all regular buildings from imported JSON
    // todo: provide building instances for current map (dynamic map loading)
    BuildingInstances[this.currentMapKey].forEach(entry => {
      ObjectFactory.setupBuilding(entry.x, entry.y, entry.buildings, entry.infested);
    });
  },

  /**
   * Initializes the map with zombies
   * @returns {void}
   */
  setupAllZeds: function () {
    // Setup all zombies from imported JSON
    // todo: provide zombie instances for current map (dynamic map loading)
    ZombieInstances[this.currentMapKey].forEach(entry => {
      ObjectFactory.setZedAt(entry.x, entry.y, entry.amount);
    });
  },

  /**
   * Initializes the map with paths
   * @returns {void}
   */
  setupAllPaths: function () {
    // Setup all paths from imported JSON
    // todo: provide path instances for current map (dynamic map loading)
    PathInstances[this.currentMapKey].vertical.forEach(path => {
      PathUtils.setupPathVer(this.getMapKey(), path.x, path.y1, path.y2);
    });
    PathInstances[this.currentMapKey].horizontal.forEach(path => {
      PathUtils.setupPathHor(this.getMapKey(), path.x1, path.x2, path.y);
    });
    PathInstances[this.currentMapKey].diagonalDown.forEach(path => {
      PathUtils.setupPathDiaDown(this.getMapKey(), path.x1, path.x2, path.y);
    });
    PathInstances[this.currentMapKey].diagonalUp.forEach(path => {
      PathUtils.setupPathDiaUp(this.getMapKey(), path.x1, path.x2, path.y);
    });
    PathInstances[this.currentMapKey].single.forEach(path => {
      PathUtils.setupPath(this.getMapKey(), path.x, path.y);
    });
    PathInstances[this.currentMapKey].remove.forEach(path => {
      PathUtils.removePath(this.getMapKey(), path.x, path.y);
    });
  },

  /**
   * @returns {string} - the key of the current map
   */
  getMapKey: function () {
    return this.currentMapKey;
  },

  /**
   * @returns {GameMap['paths']} - the 2D array representing the map's paths
   */
  getAllPaths: function () {
    return this.currentMap.paths;
  },

  /**
   * @returns {MapPosition} - the current position of the map
   */
  getMapPosition: function () {
    return this.currentMap.mapPosition;
  },

  /**
   *
   * @param {number} x - The new X coordinate for the map
   */
  setPositionX: function (x) {
    this.currentMap.mapPosition.x = x;
  },

  /**
   *
   * @param {number} y - The new Y coordinate for the map
   */
  setPositionY: function (y) {
    this.currentMap.mapPosition.y = y;
  },
};
