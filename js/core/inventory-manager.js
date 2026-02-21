// @ts-check

/**
 * @import { ItemDefinition, Item, ItemProps } from '../../data/definitions/items-definitions.js'
 * @import { CompanionDefinition } from '../../data/definitions/companion-definitions.js'
 * @import { WeaponProps } from '../../data/definitions/weapons-definitions.js'
 */

/**
 * @typedef {Object} Inventory
 * @property {Record<string, Item>} items
 * @property {Record<string, WeaponProps>} weapons
 * @property {Record<string, CompanionDefinition>} companions
 * @property {number} itemNumbers
 * @export
 */

import { GameState, EventManager, EVENTS } from './index.js';
import { ItemsDefinitions, ItemUtils } from '../../data/index.js';

// Destructure items/weapons definitions
/** @type {Record<string, ItemDefinition>} */
const items = ItemsDefinitions.items;

/** @type {Inventory} */
var inventory = {
  items: {},
  weapons: {},
  companions: {},
  itemNumbers: 0,
};

/**
 * Batching object to manage inventory change events
 * { active: boolean, oldTotal: number }
 */
var inventoryBatch = {
  active: false,
  oldTotal: 0,
};

export default {
  /**
   * @returns {Inventory}
   */
  getInventory: function () {
    return inventory;
  },

  /**
   * @returns {number}
   */
  getInventoryItemNumbers: function () {
    return inventory.itemNumbers;
  },

  /**
   * Begin batching inventory changes
   * Captures current total, multiple adds will emit single event
   * @returns {void}
   */
  beginInventoryBatch: function () {
    inventoryBatch.active = true;
    inventoryBatch.oldTotal = inventory.itemNumbers;
  },

  /**
   * End batching and emit single INVENTORY_CHANGED event
   * @returns {void}
   */
  endInventoryBatch: function () {
    inventoryBatch.active = false;
    const newTotal = inventory.itemNumbers;

    // EVENT: Notify that inventory changed
    EventManager.emit(EVENTS.INVENTORY_CHANGED, {
      oldTotal: inventoryBatch.oldTotal,
      newTotal: newTotal,
    });
  },

  /**
   * Check if inventory batch is active
   * @returns {boolean} True if inventory batch is active, false otherwise
   */
  isInventoryBatchActive: function () {
    return inventoryBatch.active;
  },

  /**
   * @param {string} item
   * @param {number} addAmount
   * @returns {void}
   */
  addItemToInventory: function (item, addAmount) {
    if (typeof addAmount === 'string') {
      console.error('addAmount must be a number, got string:', addAmount);
      return;
    }

    const itemProps = items[item],
      oldTotal = inventory.itemNumbers;

    if (inventory.items[item] !== undefined) {
      // item was added to inventory before
      inventory.items[item].amount += addAmount;
      inventory.items[item].amount < 0 ? (inventory.items[item].amount = 0) : false;
    } else if (itemProps !== undefined) {
      // item is added first time to inventory
      const character = GameState.getGameProp('character');
      inventory.items[item] = {
        ...ItemUtils.calcItemProps(item, character),
        amount: addAmount,
      };
      // emit FIRST_ITEM_ADDED event for almanac tracking
      EventManager.emit(EVENTS.FIRST_ITEM_ADDED, {
        item: item,
      });
    } else {
      console.log('adding item "' + item + '" to inventory failed');
    }
    this.calcTotalInventoryItems();

    // EVENT: Emit if not batching
    if (!inventoryBatch.active) {
      EventManager.emit(EVENTS.INVENTORY_CHANGED, {
        oldTotal: oldTotal,
        newTotal: inventory.itemNumbers,
      });
    }
  },

  /**
   * Recalculate the total count of items in inventory
   * Only counts non-weapon items with amount > 0
   * Updates inventory.itemNumbers
   * @returns {void}
   */
  calcTotalInventoryItems: function () {
    inventory.itemNumbers = 0;
    for (let item in inventory.items) {
      if (inventory.items[item].amount && inventory.items[item].amount > 0) {
        inventory.itemNumbers += inventory.items[item].amount;
      }
    }
  },

  /**
   * @param {string} item
   * @param {string} character
   * @returns {ItemProps}
   */
  calcItemProps: function (item, character) {
    return ItemUtils.calcItemProps(item, character);
  },

  /* === Item/Weapon Data Accessors === */

  /**
   * @returns {Record<string, ItemDefinition>}
   */
  getAllItems: function () {
    return items;
  },

  /**
   * Get item definition by name
   * @param {string} itemName - Item name
   * @returns {ItemDefinition}
   */
  getItemDefinition: function (itemName) {
    return items[itemName];
  },

  /**
   * @param {string} itemName - Item name
   * @returns {Item}
   */
  getItemFromInventory: function (itemName) {
    return inventory.items[itemName];
  },

  /**
   * @param {string|undefined} itemName - Item name
   * @returns {boolean}
   */
  inventoryContains: function (itemName) {
    if (itemName === undefined) {
      return false;
    } else if (inventory.items[itemName]?.amount > 0) {
      return true;
    } else if (inventory.weapons[itemName]?.amount > 0) {
      return true;
    } else if (itemName === 'water') {
      if (inventory.items['drink-1']?.amount > 0 || inventory.items['drink-2']?.amount > 0) {
        return true;
      }
    } else if (itemName === 'mushrooms') {
      if (inventory.items['mushroom-1']?.amount > 0 || inventory.items['mushroom-2']?.amount > 0) {
        return true;
      }
    } else if (itemName === 'fruits') {
      if (
        inventory.items['fruit-1']?.amount > 0 ||
        inventory.items['fruit-2']?.amount > 0 ||
        inventory.items['fruit-3']?.amount > 0
      ) {
        return true;
      }
    }
    return false;
  },

  /**
   * @param {string} itemName - Item name
   * @returns {boolean}
   */
  inventoryKnows: function (itemName) {
    if (inventory.items[itemName]) {
      return true;
    } else if (inventory.weapons[itemName]) {
      return true;
    } else if (itemName === 'water') {
      if (inventory.items['drink-1'] || inventory.items['drink-2']) {
        return true;
      }
    } else if (itemName === 'mushrooms') {
      if (inventory.items['mushroom-1'] || inventory.items['mushroom-2']) {
        return true;
      }
    } else if (itemName === 'fruits') {
      if (inventory.items['fruit-1'] || inventory.items['fruit-2'] || inventory.items['fruit-3']) {
        return true;
      }
    }
    return false;
  },

  /**
   * @param {string} itemName - Item name
   * @returns {number}
   */
  inventoryItemAmount: function (itemName) {
    if (inventory.items[itemName]) {
      return inventory.items[itemName].amount;
    } else if (itemName === 'water') {
      return (inventory.items['drink-1']?.amount || 0) + (inventory.items['drink-2']?.amount || 0);
    } else if (itemName === 'mushrooms') {
      return (
        (inventory.items['mushroom-1']?.amount || 0) + (inventory.items['mushroom-2']?.amount || 0)
      );
    } else if (itemName === 'fruits') {
      if (
        inventory.items['fruit-1']?.amount > 0 ||
        inventory.items['fruit-2']?.amount > 0 ||
        inventory.items['fruit-3']?.amount > 0
      ) {
        return (
          (inventory.items['fruit-1']?.amount || 0) +
          (inventory.items['fruit-2']?.amount || 0) +
          (inventory.items['fruit-3']?.amount || 0)
        );
      }
    }
    return 0;
  },

  /**
   * @param {string} itemType - Item type
   * @returns {Item | undefined}
   */
  getFirstItemOfType: function (itemType) {
    for (const item in inventory.items) {
      if (inventory.items[item].type === itemType && inventory.items[item].amount) {
        return inventory.items[item];
      }
    }
  },

  /**
   * @param {string} itemName - Item name
   * @returns {Item | undefined}
   */
  getItemByName: function (itemName) {
    return inventory.items[itemName];
  },
};
