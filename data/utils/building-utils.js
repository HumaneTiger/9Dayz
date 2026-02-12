import { BuildingDefinitions } from '../index.js';

const { buildingTypes, buildingActions } = BuildingDefinitions;

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

  /**
   * Get available actions for a building based on type, state, and character
   * @param {string} buildingName - Name of the building
   * @param {boolean} locked - Whether the building is locked
   * @param {boolean} infested - Whether the building is infested
   * @param {string} character - Character type
   * @returns {Array<object>} Array of action objects
   */
  getBuildingActionsFor: function (buildingName, locked, infested, character) {
    const buildingType = this.getBuildingTypeOf(buildingName);
    const actions = buildingActions[buildingType];
    let actionSet = [];
    // adding actions for certain character <-> building combos
    if (buildingName === 'fireplace') {
      if (character !== 'craftsmaniac' && character !== 'cashmeister')
        actionSet.push({ id: 'cook', label: 'cook', time: 30 });
      if (character === 'treehugger')
        actionSet.push({ id: 'sleep', label: 'sleep', time: 120, energy: 60 });
    }
    if (actions !== undefined) {
      actions.forEach(action => {
        let singleAction = {};
        singleAction.name = action.split('|')[0]; // old
        singleAction.label = action.split('|')[0]; // new
        singleAction.id = action.split('|')[0].replaceAll(' ', '-'); // new
        if (
          (buildingName === 'pump' && singleAction.id === 'fish') ||
          (buildingName === 'outhouse' && singleAction.id === 'break-door') ||
          (buildingName === 'outhouse' && singleAction.id === 'unlock-door') ||
          (buildingName === 'small-tree' && singleAction.id === 'rest') ||
          (buildingName === 'big-tree' && singleAction.id === 'cut-down') ||
          (buildingName === 'fireplace' && singleAction.id === 'break-door') ||
          (buildingName === 'fireplace' && singleAction.id === 'unlock-door') ||
          (buildingName === 'fireplace' && singleAction.id === 'scout-area') ||
          (buildingName === 'fireplace' && singleAction.id === 'search') ||
          (buildingName === 'barricades' && singleAction.id === 'break-door') ||
          (buildingName === 'barricades' && singleAction.id === 'unlock-door') ||
          (buildingName === 'barricades' && singleAction.id === 'scout-area') ||
          (buildingName === 'barricades' && singleAction.id === 'search') ||
          (buildingName === 'seating' && singleAction.id === 'break-door') ||
          (buildingName === 'seating' && singleAction.id === 'unlock-door') ||
          (buildingName === 'seating' && singleAction.id === 'scout-area') ||
          (buildingName === 'seating' && singleAction.id === 'sleep') ||
          (buildingName === 'well' && singleAction.id === 'fish')
        ) {
          // these are exceptions for certain building <-> action combos that make no sense
        } else if (
          (!locked && singleAction.id === 'smash-window') ||
          (!locked && singleAction.id === 'unlock-door') ||
          (!locked && singleAction.id === 'break-door')
        ) {
          // these are exceptions for certain stats <-> action combos that make no sense
        } else if (
          (character === 'snackivore' && singleAction.id === 'drink') ||
          (character === 'furbuddy' && singleAction.id === 'cut')
        ) {
          // removing actions for certain character <-> building combos
          // see fireplace above for craftsmaniac/cooking
        } else {
          singleAction.time = parseInt(action.split('|')[1]);
          singleAction.energy = parseInt(action.split('|')[2] || 0);
          actionSet.push(singleAction);
        }

        if (
          singleAction.id === 'gather' ||
          singleAction.id === 'search' ||
          singleAction.id === 'rest' ||
          singleAction.id === 'sleep' ||
          singleAction.id === 'cut-down' ||
          singleAction.id === 'cook' ||
          singleAction.id === 'drink' ||
          singleAction.id === 'read'
        ) {
          singleAction.needsUnlock = true;
        } else {
          singleAction.needsUnlock = false;
        }
        if (infested && (singleAction.id === 'search' || singleAction.id === 'gather')) {
          singleAction.critical = true;
        }
        singleAction.locked = undefined;
      });
    }
    return actionSet;
  },
};
