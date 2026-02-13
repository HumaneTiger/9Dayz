// @ts-check

import {
  BuildingInstances,
  ZombieInstances,
  PathInstances,
  PathUtils,
  BuildingDefinitions,
  CharacterDefinitions,
} from '../../data/index.js';
import GameState from './game-state.js';
import ObjectFactory from './object-factory.js';

const { buildingActions } = BuildingDefinitions;

const mapSize = GameState.getGameProp('mapSize');

/**
 * @typedef {Object} Path
 * @property {number} x
 * @property {number} y
 */

/* create 2D array with map size for paths */
/** @type {Path[][]} */
var paths = Array.from({ length: mapSize.width }, () => new Array(mapSize.height));

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
    PathInstances.paths.forEach(path => {
      switch (path.type) {
        case 'vertical':
          PathUtils.setupPathVer(paths, path.x, path.y1, path.y2);
          break;
        case 'horizontal':
          PathUtils.setupPathHor(paths, path.x1, path.x2, path.y);
          break;
        case 'diagonalDown':
          PathUtils.setupPathDiaDown(paths, path.x1, path.x2, path.y);
          break;
        case 'diagonalUp':
          PathUtils.setupPathDiaUp(paths, path.x1, path.x2, path.y);
          break;
        case 'single':
          PathUtils.setupPath(paths, path.x, path.y);
          break;
        case 'remove':
          PathUtils.removePath(paths, path.x, path.y);
          break;
      }
    });
  },

  /**
   * @returns {Path[][]}
   */
  getAllPaths: function () {
    return paths;
  },

  /**
   * @returns {void}
   */
  modifyObjectProperties: function () {
    const character = GameState.getGameProp('character');
    const charDef = CharacterDefinitions[character];

    if (charDef?.buildingActionModifiers) {
      for (const buildingType in charDef.buildingActionModifiers) {
        const modifiers = charDef.buildingActionModifiers[buildingType];
        for (const actionIndex in modifiers) {
          buildingActions[buildingType][actionIndex] = modifiers[actionIndex];
        }
      }
    }
  },
};
