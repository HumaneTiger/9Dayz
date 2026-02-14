import { ObjectState } from './core/index.js';
import { ActionsDefinitions } from '../data/definitions/index.js';

export default {
  getActionData: function (cardId, action) {
    const object = ObjectState.getObject(cardId);
    const actionObject = object.actions.find(singleAction => singleAction.id === action);
    const actionProps = ActionsDefinitions.actionProps[action];

    return {
      actionObject,
      actionProps,
      isValid: actionObject && actionProps,
    };
  },

  /* TODO: get actions for a type of game object, see object factory actions: for that */
  /* TODO: find a definition based solution for getBuildingActionsFor in building-utils.js */
  /* TODO: get actions for building types, in building definitions there are building actions */
};
