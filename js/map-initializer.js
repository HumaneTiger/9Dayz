import buildingData from '../data/map/building-instances.js';
import zombieData from '../data/map/zombie-instances.js';
import pathData from '../data/map/path-instances.js';
import LootUtils from '../data/utils/loot-utils.js';
import PathUtils from '../data/utils/path-utils.js';
import {
  BuildingDefinitions,
  CharacterDefinitions,
  ItemsWeaponsDefinitions,
} from '../data/index.js';
import GameState from './game-state.js';
import ObjectFactory from './object-factory.js';

const mapSize = { width: 49, height: 45 };
const { buildingActions } = BuildingDefinitions;
const { weaponProps } = ItemsWeaponsDefinitions;

// create 2D array with map size for paths
var paths = Array.from({ length: mapSize.width }, () => new Array(mapSize.height));

let targetLocations = {
  'Lakeside Camp Resort': [5, 37],
  Rocksprings: [22, 34],
  'Haling Cove': [16, 8],
  Litchfield: [15, 23],
  Greenleafton: [33, 35],
  'Billibalds Farm': [40, 30],
  'Camp Silverlake': [28, 22],
  'Harbor Gas Station': [34, 16],
};

export default {
  setupAllBuildings: function () {
    // ONLY FOR TUTORIAL (hardcoded - special case)
    if (GameState.getGameProp('tutorial')) {
      ObjectFactory.setupBuilding(
        18,
        44,
        ['crate'],
        false,
        LootUtils.forceLootItemList(['drink-5', 'fruit-bread', 'wooden-club'])
      );
      ObjectFactory.setupWeapon(18, 44, 'axe', {
        attack: weaponProps['axe'].attack / 2,
        defense: weaponProps['axe'].defense / 2,
        durability: weaponProps['axe'].durability / 2,
      });
      ObjectFactory.setZedAt(18, 42, 1, 3, 2); // weak zed for tutorial
    }

    // Setup all regular buildings from imported JSON
    buildingData.buildings.forEach(entry => {
      ObjectFactory.setupBuilding(entry.x, entry.y, entry.buildings, entry.infested);
    });
  },

  setupAllZeds: function () {
    // Setup all zombies from imported JSON
    zombieData.zombies.forEach(entry => {
      ObjectFactory.setZedAt(entry.x, entry.y, entry.amount);
    });
  },

  setupAllPaths: function () {
    // Setup all paths from imported JSON
    pathData.paths.forEach(path => {
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

  getAllPaths: function () {
    return paths;
  },

  getAllTargetLocations: function () {
    return targetLocations;
  },

  /* === Initialization === */

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
