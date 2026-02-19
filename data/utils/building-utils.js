// @ts-check
import { BuildingDefinitions } from '../index.js';

const { buildingTypes } = BuildingDefinitions;

export default {
  /**
   * Get the type category of a building (house, car, farm, tree, etc.)
   * @param {string} buildingName - Name of the building
   * @returns {string|undefined} Building type or undefined if not found
   */
  getBuildingTypeOf: function (buildingName) {
    for (const type in buildingTypes) {
      if (buildingTypes[type].includes(buildingName)) {
        return type;
      }
    }
  },

  /**
   * Calculate loot probability for a building based on character type
   * Returns [firstItemChance, nextItemsChance]
   * @param {string} buildingName - Name of the building
   * @param {string} character - Character type (treehugger, snackivore, etc.)
   * @returns {number[]} Array of [firstItemChance, nextItemsChance]
   */
  getLootBuildingProbability: function (buildingName, character) {
    const type = this.getBuildingTypeOf(buildingName);

    if (buildingName === 'crate') {
      return [11, 0];
    }

    // house, car, farm, tree, church, train, shop, industrial, water, camping, corpse
    if (character === 'treehugger') {
      if (
        type === 'house' ||
        type === 'car' ||
        type === 'train' ||
        type === 'shop' ||
        type === 'industrial'
      ) {
        return [7, 3];
      } else if (type === 'farm' || type === 'tree' || type === 'water' || type === 'camping') {
        return [11, 8];
      }
    } else if (character === 'snackivore') {
      if (type === 'house' || type === 'car' || type === 'train' || type === 'shop') {
        return [11, 8];
      } else if (type === 'farm' || type === 'tree' || type === 'water') {
        return [7, 3];
      }
    } else if (character === 'craftsmaniac') {
      if (
        type === 'industrial' ||
        type === 'car' ||
        type === 'train' ||
        buildingName === 'basement'
      ) {
        return [11, 8];
      }
    } else if (character === 'cashmeister') {
      return [7, 3];
    }

    // defaults
    return [9, 6];
  },
};
