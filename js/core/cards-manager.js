// @ts-check
/**
 * @import { Card, CardDeck, BattleCard, BattleDeck, OpponentDeck } from '../../data/definitions/cards-definitions.js'
 */

import { CardsDefinitions } from '../../data/index.js';
import {
  CharacterManager,
  GameState,
  InventoryManager,
  ObjectState,
  WeaponsManager,
  CompanionManager,
} from './index.js';

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

  cleanupCardDeck: function () {
    // removing all removed ids at the very end outside the foreach
    // doing it the very old school "go backward" way, as this is the most solid approach to avoid any kind of crazy problems
    for (let i = CardsDefinitions.cardDeck.length - 1; i >= 0; i--) {
      const object = ObjectState.getObject(CardsDefinitions.cardDeck[i].id);
      if (object.removed) {
        CardsDefinitions.cardDeck.splice(i, 1);
      }
    }
  },

  /**
   * @returns {number[]} - an array of object ids that are zombies nearby the player
   */
  getAllZedsNearbyIds: function () {
    /** @type {number[]} */
    let allZedIds = [];
    CardsDefinitions.cardDeck.forEach(
      /** @type {Card} */ card => {
        let object = ObjectState.getObject(card.id);
        if (
          object.distance !== null &&
          object.group === 'zombie' &&
          object.distance < 2.5 &&
          !object.dead
        ) {
          allZedIds.push(card.id);
        }
      }
    );
    return allZedIds;
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
   * @returns {OpponentDeck}
   */
  getOpponentDeck: function () {
    return CardsDefinitions.opponentDeck;
  },

  /**
   * @param {number} id
   * @returns {OpponentDeck} the updated opponent deck with the new id added
   */
  addIdToOpponentDeck: function (id) {
    CardsDefinitions.opponentDeck.push(id);
    return CardsDefinitions.opponentDeck;
  },

  /**
   * @returns {OpponentDeck} the updated opponent deck with all nearby zed ids added
   */
  addAllZedsNearby: function () {
    const allZedIdsNearby = this.getAllZedsNearbyIds();
    allZedIdsNearby.forEach(zedId => {
      this.addIdToOpponentDeck(zedId);
    });
    return CardsDefinitions.opponentDeck;
  },

  zedIsDead: function () {
    return CardsDefinitions.opponentDeck.every(
      /** @type {(id: number) => boolean} */
      id => ObjectState.getObject(id).dead ?? false
    );
  },

  /**
   * Removes all cards from the opponent deck, effectively resetting it for the next battle
   */
  removeOpponentDeck: function () {
    CardsDefinitions.opponentDeck = [];
  },

  /**
   * @returns {BattleDeck}
   */
  getBattleDeck: function () {
    return CardsDefinitions.battleDeck;
  },

  /**
   *
   * @param {string} itemName
   * @returns {BattleCard|undefined} the battle card corresponding to the given item name
   */
  getBattleDeckCard: function (itemName) {
    return CardsDefinitions.battleDeck.find(card => card.name === itemName);
  },

  /**
   * @param {string} itemName
   */
  removeFromBattleDeck: function (itemName) {
    for (let i = 0; i < CardsDefinitions.battleDeck.length; i += 1) {
      if (CardsDefinitions.battleDeck[i].name === itemName) {
        CardsDefinitions.battleDeck.splice(i, 1);
        break;
      }
    }
  },

  /**
   * @returns {number} - the number of spared items
   */
  generateBattleDeck: function () {
    CardsDefinitions.battleDeck = [];
    const inventory = InventoryManager.getInventory();
    let sparedItems = 0;
    const inventoryItemsAndWeapons = {
      ...inventory.items,
      ...inventory.weapons,
    };
    /* add companion when character is furbuddy */
    if (CompanionManager.isCompanionActive() && GameState.getGameProp('character') === 'furbuddy') {
      const companion = CompanionManager.getCompanionFromInventory();
      if (companion !== undefined) {
        inventoryItemsAndWeapons[companion.name] = {
          ...companion,
          durability: 1 /* just a placeholder */,
          amount: 1 /* there is always 1 companion */,
        };
      }
    }

    // Makes battle deck construction deterministic rather than relying on JavaScript's object key ordering
    const sortedKeys = Object.keys(inventoryItemsAndWeapons).sort((a, b) => a.localeCompare(b));
    for (const item of sortedKeys) {
      for (let i = 0; i < inventoryItemsAndWeapons[item].amount; i++) {
        if (CharacterManager.shouldExcludeItemFromBattle(item)) {
          sparedItems += 1;
        } else {
          CardsDefinitions.battleDeck.push(
            this.getBattleCard({
              damage: inventoryItemsAndWeapons[item].damage,
              modifyDamage: CharacterManager.calculateModifyDamageForItem(item) || 0,
              id: i,
              name: item,
              protection: inventoryItemsAndWeapons[item].protection || 0,
            })
          );
        }
      }
    }
    return sparedItems;
  },

  /**
   * @param {BattleCard} props
   * @returns {BattleCard}
   */
  getBattleCard: function (props) {
    return {
      damage: props.damage,
      modifyDamage: props.modifyDamage,
      id: props.id,
      name: props.name,
      protection: props.protection,
    };
  },

  /**
   * @returns {number} - the size of the battle deck
   */
  getBattleDeckSize: function () {
    return CardsDefinitions.battleDeck.length;
  },

  /**
   * Removes all cards from the battle deck, effectively resetting it for the next battle
   */
  removeBattleDeck: function () {
    CardsDefinitions.battleDeck = [];
  },

  /**
   * Reduces the durability of a weapon or removes an item from the battle deck
   * @param {string} itemName
   */
  reduceDurabilityOrRemove: function (itemName) {
    if (WeaponsManager.isWeapon(itemName)) {
      const weapon = WeaponsManager.getWeaponFromInventory(itemName);
      if (weapon.durability && weapon.durability > 0) {
        weapon.durability -= 1;
      }
      if (!weapon.durability) {
        // remove weapon from inventory
        WeaponsManager.removeWeaponFromInventory(weapon.name);
        // remove card from battle deck
        this.removeFromBattleDeck(itemName);
      }
    } else if (CompanionManager.isCompanion(itemName)) {
      const companion = CompanionManager.getCompanionFromInventory();
      if (!companion) {
        console.warn(
          'Attempting to reduce durability of companion "' +
            itemName +
            '" but no active companion found'
        );
        return;
      }
      if (companion.health > 0) {
        companion.health -= 3; // companion takes 3 damage when used in battle
      }
      if (companion.health <= 0) {
        // remove companion from inventory
        companion.health = 0;
        // remove card from battle deck
        this.removeFromBattleDeck(itemName);
      }
    } else {
      // remove item from inventory
      InventoryManager.addItemToInventory(itemName, -1);
      // remove card from battle deck
      this.removeFromBattleDeck(itemName);
    }
  },
};
