import { ObjectState } from './index.js';
import { ActionsDefinitions } from '../../data/definitions/index.js';

export default {
  /* === Card-based (instance-specific) methods === */

  getCardActionObject: function (cardId, action) {
    const object = ObjectState.getObject(cardId);
    return object.actions.find(singleAction => singleAction.id === action);
  },

  isValid: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    const actionProps = ActionsDefinitions.actionProps[action];
    return actionObject && actionProps;
  },

  getCardBasedEnergy: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    return actionObject?.energy;
  },

  getCardBasedTime: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    return actionObject?.time;
  },

  isCardActionLocked: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    return actionObject?.locked;
  },

  isCardActionCritical: function (cardId, action) {
    const actionObject = this.getCardActionObject(cardId, action);
    return actionObject?.critical;
  },

  /* === Static definition methods === */

  getActionDelay: function (action) {
    const actionProps = ActionsDefinitions.actionProps[action];
    return actionProps?.delay;
  },

  getActionMethod: function (action) {
    const actionProps = ActionsDefinitions.actionProps[action];
    return actionProps?.method;
  },

  getActionLabel: function (action) {
    const actionProps = ActionsDefinitions.actionProps[action];
    return actionProps?.label;
  },

  /* === Object type methods === */

  getActionsForGameObjectType: function (objectType) {
    const actions = ActionsDefinitions.objectTypeActions[objectType];
    return actions ? JSON.parse(JSON.stringify(actions)) : [];
  },

  /* TODO: get actions for building types, in building definitions there are building actions */
  /* TODO: find a definition based solution for getBuildingActionsFor in building-utils.js */
};
