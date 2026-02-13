// @ts-check

/**
 * @import { ItemDefinition } from '../../data/definitions/items-weapons-definitions.js'
 * @import { ItemProps } from '../../data/definitions/items-weapons-definitions.js'
 * @import { WeaponProps } from '../../data/definitions/items-weapons-definitions.js'
 * @import { WeaponUpgrade } from '../../data/definitions/items-weapons-definitions.js'
 * @import { WeaponUpgrades } from '../../data/definitions/items-weapons-definitions.js'
 */

/**
 * @typedef {Object} Inventory
 * @property {Record<string, ItemProps>} items
 * @property {Record<string, WeaponProps>} weapons
 * @property {number} itemNumbers
 * @export
 */

import Events, { EVENTS } from '../events.js';
import { GameState } from './index.js';
import { ItemsWeaponsDefinitions, CharacterDefinitions, ItemUtils } from '../../data/index.js';

// Destructure items/weapons definitions
/** @type {Record<string, ItemDefinition>} */
const items = ItemsWeaponsDefinitions.items;

/** @type {Inventory} */
var inventory = {
  items: {},
  weapons: {} /* coming soon */,
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
   * @param {string} character
   * @returns {Record<string, number>}
   */
  getInventoryPresets: function (character) {
    return CharacterDefinitions[character]?.inventoryPreset || {};
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
    Events.emit(EVENTS.INVENTORY_CHANGED, {
      oldTotal: inventoryBatch.oldTotal,
      newTotal: newTotal,
    });
  },

  /**
   * @param {string} item
   * @param {number} addAmount
   * @param {WeaponProps} setWeaponProps
   * @returns {void}
   */
  addWeaponToInventory: function (item, addAmount, setWeaponProps) {
    if (typeof addAmount === 'string') {
      console.error('addAmount must be a number, got string:', addAmount);
      return;
    }

    const setDamage = setWeaponProps.damage,
      setProtection = setWeaponProps.protection,
      setDurability = setWeaponProps.durability,
      itemProps = items[item];

    const oldTotal = this.getWeaponTotal();

    if (inventory.items[item] !== undefined) {
      // weapon was added to inventory before
      inventory.items[item].amount += addAmount;
      inventory.items[item].amount < 0 ? (inventory.items[item].amount = 0) : false;

      setDamage ? (inventory.items[item].damage = setDamage) : false;
      setProtection ? (inventory.items[item].protection = setProtection) : false;

      if (setDurability !== undefined) {
        inventory.items[item].durability += setDurability;
        if (inventory.items[item].durability <= 0) {
          // remove and reset inventory weapon props
          inventory.items[item].amount = 0;
          inventory.items[item].damage = ItemUtils.calcItemDamage(item);
          inventory.items[item].protection = ItemUtils.calcItemProtection(item);
          inventory.items[item].durability = 0;
        }
      }
    } else if (itemProps !== undefined) {
      // weapon is added first time to inventory
      inventory.items[item] = {
        type: itemProps[0],
        name: item,
        amount: addAmount,
        damage: setDamage || ItemUtils.calcItemDamage(item),
        protection: setProtection || ItemUtils.calcItemProtection(item),
        durability: setDurability,
      };
    } else {
      console.log('adding weapon "' + item + '" to inventory failed');
    }

    const newTotal = this.getWeaponTotal();

    // EVENT: Emit if not batching
    if (!inventoryBatch.active) {
      Events.emit(EVENTS.WEAPON_CHANGED, {
        oldTotal: oldTotal,
        newTotal: newTotal,
      });
    }
  },

  /**
   * @returns {number}
   */
  getWeaponTotal: function () {
    let total = 0;
    for (let item in inventory.items) {
      if (inventory.items[item].type === 'extra' && inventory.items[item].amount > 0) {
        total += 1;
      }
    }
    return total;
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
      console.log(ItemUtils.calcItemProps(item, character));
      inventory.items[item] = ItemUtils.calcItemProps(item, character);
      inventory.items[item].amount = addAmount;
      // emit FIRST_ITEM_ADDED event for almanac tracking
      Events.emit(EVENTS.FIRST_ITEM_ADDED, {
        item: item,
      });
    } else {
      console.log('adding item "' + item + '" to inventory failed');
    }
    this.calcTotalInventoryItems();

    // EVENT: Emit if not batching
    if (!inventoryBatch.active) {
      Events.emit(EVENTS.INVENTORY_CHANGED, {
        oldTotal: oldTotal,
        newTotal: inventory.itemNumbers,
      });
    }
  },

  /**
   * Recalculate the total count of items in inventory
   * Only counts non-weapon items (type !== 'extra') with amount > 0
   * Updates inventory.itemNumbers
   * @returns {void}
   */
  calcTotalInventoryItems: function () {
    inventory.itemNumbers = 0;
    for (let item in inventory.items) {
      if (
        inventory.items[item].type !== 'extra' &&
        inventory.items[item].amount &&
        inventory.items[item].amount > 0
      ) {
        inventory.itemNumbers += inventory.items[item].amount;
      }
    }
  },

  /**
   * @param {string} item
   * @param {string} character
   * @returns {ItemProps | undefined}
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
   * @param {string} item - Item name
   * @returns {ItemDefinition}
   */
  getItem: function (item) {
    return items[item];
  },

  /**
   * @param {string} itemName
   * @returns {WeaponProps | Record<string, WeaponProps>}
   */
  getWeaponProps: function (itemName) {
    const { weaponProps } = ItemsWeaponsDefinitions;
    if (itemName) {
      return weaponProps[itemName];
    } else {
      return weaponProps;
    }
  },

  /**
   * @param {string} itemName
   * @returns {WeaponUpgrade | WeaponUpgrades}
   */
  getWeaponPropsUpgrades: function (itemName) {
    const { weaponPropsUpgrades } = ItemsWeaponsDefinitions;
    if (itemName) {
      return weaponPropsUpgrades[itemName];
    } else {
      return weaponPropsUpgrades;
    }
  },
};
