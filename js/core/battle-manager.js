// @ts-check
/**
 * @import { BattleCard, BattleDeck, DefensiveDeck, OpponentDeck } from '../../data/definitions/cards-definitions.js'
 * @import { GameObject } from './object-state.js'
 */

import { CardsDefinitions } from '../../data/index.js';
import {
  ObjectState,
  CharacterManager,
  InventoryManager,
  WeaponsManager,
  CompanionManager,
} from './index.js';

export default {
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
    if (CharacterManager.addCompanionToBattleDeck()) {
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

  /**
   * @param {number[]} barricadeIds
   */
  includeBarricadesInBattle: function (barricadeIds) {
    barricadeIds.forEach(id => {
      this.addIdToDefensiveDeck(id);
    });
  },

  /**
   * @returns {DefensiveDeck}
   */
  getDefensiveDeck: function () {
    return CardsDefinitions.defensiveDeck;
  },

  /**
   *
   * @returns {GameObject|null} the first defensive card object in the defensive deck that has durability left, or null if there are no such cards
   */
  getFirstDurableCardFromDefensiveDeck: function () {
    const defensiveDeck = CardsDefinitions.defensiveDeck;
    const firstCardId = defensiveDeck.find(id => {
      const defensiveObject = ObjectState.getObject(id);
      return defensiveObject.durability && defensiveObject.durability > 0;
    });
    if (firstCardId === undefined) {
      return null;
    }
    return ObjectState.getObject(firstCardId);
  },

  /**
   * @param {number} id
   * @returns {DefensiveDeck} the updated defensive deck with the new id added
   */
  addIdToDefensiveDeck: function (id) {
    CardsDefinitions.defensiveDeck.push(id);
    return CardsDefinitions.defensiveDeck;
  },

  /**
   * @param {number} id
   */
  removeIdFromDefensiveDeck: function (id) {
    const index = CardsDefinitions.defensiveDeck.indexOf(id);
    if (index > -1) {
      CardsDefinitions.defensiveDeck.splice(index, 1);
    }
  },

  /**
   * Removes all cards from the defensive deck, effectively resetting it for the next battle
   */
  removeDefensiveDeck: function () {
    CardsDefinitions.defensiveDeck = [];
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
   * Finds all nearby zeds and adds their ids to the opponent deck
   * @param {GameObject} object - the object around which to find nearby zeds
   * @returns {OpponentDeck} the updated opponent deck with all nearby zed ids added
   */
  addAllZedsNearby: function (object) {
    if (!object || object.x === undefined || object.y === undefined) {
      console.warn('Invalid object provided to addAllZedsNearby:', object);
      return CardsDefinitions.opponentDeck;
    }
    const allZedIdsNearby = ObjectState.findAllZedsNearObject(object.x, object.y);
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
};
