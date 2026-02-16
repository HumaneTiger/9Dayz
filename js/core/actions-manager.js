// @ts-check
/**
 * @import { GameAction } from '../../data/definitions/actions-definitions.js'
 */

import { ObjectState } from './index.js';
import { ActionsDefinitions } from '../../data/definitions/index.js';

export default {
  /* === Card-based (instance-specific) methods === */

  /**
   * @param {number} cardId - Object ID of the game card/object
   * @param {string} action - Action ID to find
   * @returns {GameAction|undefined} The action object if found
   */
  getCardActionObject: function (cardId, action) {
    const object = ObjectState.getObject(cardId);
    return object.actions.find(singleAction => singleAction.id === action);
  },

  /**
   * @param {number} cardId - Object ID of the game card/object
   * @param {string} action - Action ID to validate
   * @returns {boolean} Whether the action exists both on card and in definitions
   */
  isValid: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    const actionProps = ActionsDefinitions.actionProps[action];
    return !!(actionObject && actionProps);
  },

  /**
   * @param {number} cardId - Object ID of the game card/object
   * @param {string} action - Action ID
   * @returns {number|undefined} Energy cost/gain of the action
   */
  getCardBasedEnergy: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    return actionObject?.energy;
  },

  /**
   * @param {number} cardId - Object ID of the game card/object
   * @param {string} action - Action ID
   * @returns {number|undefined} Time duration of the action
   */
  getCardBasedTime: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    return actionObject?.time;
  },

  /**
   * @param {number} cardId - Object ID of the game card/object
   * @param {string} action - Action ID
   * @returns {boolean|undefined} Whether the action is locked
   */
  isCardActionLocked: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    return actionObject?.locked;
  },

  /**
   * @param {number} cardId - Object ID of the game card/object
   * @param {string} action - Action ID
   * @returns {boolean|undefined} Whether the action has critical status
   */
  isCardActionCritical: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    return actionObject?.critical;
  },

  /* === Static definition methods === */

  /**
   * @param {string} action - Action ID
   * @returns {number|undefined} Delay in milliseconds before action execution
   */
  getActionDelay: function (action) {
    const actionProps = ActionsDefinitions.actionProps[action];
    return actionProps?.delay;
  },

  /**
   * @param {string} action - Action ID
   * @returns {string|undefined} Method name to execute for this action
   */
  getActionMethod: function (action) {
    const actionProps = ActionsDefinitions.actionProps[action];
    return actionProps?.method;
  },

  /**
   * @param {string} action - Action ID
   * @returns {string|undefined} Display label for the action
   */
  getActionLabel: function (action) {
    const actionProps = ActionsDefinitions.actionProps[action];
    return actionProps?.label;
  },

  /* === Object type methods === */

  /**
   * @param {string} objectType - Game object type (zombie, creature, animal, etc.)
   * @returns {GameAction[]} Array of available actions for that object type
   */
  getActionsForGameObjectType: function (objectType) {
    const actions = ActionsDefinitions.objectTypeActions[objectType];
    return actions ? JSON.parse(JSON.stringify(actions)) : [];
  },

  /* === Building action methods === */

  /**
   * Get available actions for a building based on type, state, and character
   * Filters building actions by:
   * - excludeBuildings: removes actions for specific building names
   * - excludeCharacters: removes actions for specific characters
   * - forCharactersOnly: restricts actions to specific characters
   * - requiresLocked: includes only if building is locked
   * - infested state: marks search/gather as critical
   *
   * @param {string} buildingName - Name of the specific building instance
   * @param {string} buildingType - Type of building (house, car, farm, etc.)
   * @param {boolean} locked - Whether the building is locked
   * @param {boolean} infested - Whether the building is infested
   * @param {string} character - Current character type
   * @returns {GameAction[]} Array of filtered action objects
   */
  getActionsForBuildingType: function (buildingName, buildingType, locked, infested, character) {
    const baseActions = ActionsDefinitions.buildingActions[buildingType];
    if (!baseActions) return [];

    return baseActions
      .filter(action => {
        // Skip if excluded for this building name
        if (action.excludeBuildings && action.excludeBuildings.includes(buildingName)) {
          return false;
        }

        // Skip if excluded for this character
        if (action.excludeCharacters && action.excludeCharacters.includes(character)) {
          return false;
        }

        // Skip if restricted to specific characters and this char is not included
        if (action.forCharactersOnly && !action.forCharactersOnly.includes(character)) {
          return false;
        }

        // Skip if action requires locked building but building is not locked
        if (action.requiresLocked && !locked) {
          return false;
        }

        return true;
      })
      .map(action => {
        // Deep copy the action object
        const result = JSON.parse(JSON.stringify(action));

        // Add critical flag for search/gather when building is infested
        if (infested && (action.id === 'search' || action.id === 'gather')) {
          result.critical = true;
        }

        return result;
      });
  },
};
