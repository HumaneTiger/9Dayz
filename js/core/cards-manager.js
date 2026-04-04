// @ts-check
/**
 * @import { Card, CardDeck, CardDeckFilter } from '../../data/definitions/cards-definitions.js'
 */

import { CardsDefinitions } from '../../data/index.js';
import { ActionsManager, GameState, ObjectState } from './index.js';

export default {
  /**
   * @returns {CardDeck}
   */
  getCardDeck: function () {
    return CardsDefinitions.cardDeck;
  },

  /**
   * Calculates and updates the distance of each card in the card deck from the player
   */
  updateCardDeckProperties: function () {
    CardsDefinitions.cardDeck.forEach(
      /** @type {Card} */ card => {
        let object = ObjectState.getObject(card.id);
        if (!object || !object.x || !object.y) return;

        // event cards are always closest
        if (object.group === 'event') {
          card.distance = -1;
        } else {
          const playerPosition = GameState.getGameProp('playerPosition');
          card.distance = Math.sqrt(
            Math.pow(playerPosition.x - object.x, 2) + Math.pow(playerPosition.y - object.y, 2)
          );
        }
      }
    );
  },

  calculateCardDeckProperties: function () {
    this.updateCardDeckProperties();
    this.getCardDeck().forEach(card => {
      ActionsManager.updateActionsForObject(card.id);
    });
  },

  cleanupCardDeck: function () {
    // removing all removed ids at the very end outside the foreach
    // doing it the very old school "go backward" way, as this is the most solid approach to avoid any kind of crazy problems
    for (let i = CardsDefinitions.cardDeck.length - 1; i >= 0; i--) {
      const objectId = CardsDefinitions.cardDeck[i].id;
      const object = ObjectState.getObject(objectId);
      if (object.removed) {
        CardsDefinitions.cardDeck.splice(i, 1);
        if (object.x !== undefined && object.y !== undefined) {
          ObjectState.removeObjectIdAt(object.x, object.y, objectId);
        }
      }
    }
  },

  /**
   * @param {number[]} objectIds
   */
  addObjectIdsToCardDeck: function (objectIds) {
    if (objectIds === undefined) {
      return;
    }
    objectIds?.forEach(objectId => {
      let object = ObjectState.getObject(objectId);
      if (!object.discovered && !object.removed) {
        this.addCardToCardDeck({
          id: objectId,
          distance: 0,
        });
      }
    });
  },

  /**
   * @param {Card} card
   */
  addCardToCardDeck: function (card) {
    CardsDefinitions.cardDeck.push(card);
  },

  /**
   * @returns {boolean}
   */
  isCardDeckFilterActive: function () {
    return CardsDefinitions.cardDeckFilters.active;
  },

  /**
   * @param {boolean} active
   */
  setCardDeckFilterActive: function (active) {
    CardsDefinitions.cardDeckFilters.active = active;
  },

  /**
   * @param {CardDeckFilter} filter
   */
  setCardDeckFilter: function (filter) {
    const cardDeckFilter = CardsDefinitions.cardDeckFilters;
    cardDeckFilter.filter = filter;
  },

  /**
   * @returns {CardDeckFilter}
   */
  getCardDeckFilter: function () {
    return CardsDefinitions.cardDeckFilters.filter;
  },
};
