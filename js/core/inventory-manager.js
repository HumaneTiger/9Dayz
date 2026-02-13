// @ts-check

/**
 * @import { ItemDefinition, ItemProps } from '../../data/definitions/items-definitions.js'
 * @import { WeaponDefinition, WeaponProps, WeaponUpgrade, WeaponUpgrades } from '../../data/definitions/weapons-definitions.js'
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
import {
  ItemsDefinitions,
  WeaponsDefinitions,
  CharacterDefinitions,
  ItemUtils,
} from '../../data/index.js';

// Destructure items/weapons definitions
/** @type {Record<string, ItemDefinition>} */
const items = ItemsDefinitions.items;

/** @type {Record<string, WeaponDefinition>} */
const weapons = WeaponsDefinitions.weapons;

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
   * @param {string} weaponName
   * @param {number} addAmount
   * @param {WeaponProps} setWeaponProps
   * @returns {void}
   */
  addWeaponToInventory: function (weaponName, addAmount, setWeaponProps) {
    if (typeof addAmount === 'string') {
      console.error('addAmount must be a number, got string:', addAmount);
      return;
    }

    const setDamage = setWeaponProps.damage,
      setProtection = setWeaponProps.protection,
      setDurability = setWeaponProps.durability,
      weaponProps = weapons[weaponName];

    const oldTotal = this.getWeaponTotal();

    if (inventory.weapons[weaponName] !== undefined) {
      // weapon was added to inventory before
      inventory.weapons[weaponName].amount += addAmount;
      inventory.weapons[weaponName].amount < 0 ? (inventory.weapons[weaponName].amount = 0) : false;

      setDamage ? (inventory.weapons[weaponName].damage = setDamage) : false;
      setProtection ? (inventory.weapons[weaponName].protection = setProtection) : false;

      if (setDurability !== undefined) {
        inventory.weapons[weaponName].durability += setDurability;
        if (inventory.weapons[weaponName].durability <= 0) {
          // remove and reset inventory weapon props
          inventory.weapons[weaponName].amount = 0;
          inventory.weapons[weaponName].damage = weapons[weaponName].attack;
          inventory.weapons[weaponName].protection = weapons[weaponName].defense;
          inventory.weapons[weaponName].durability = 0;
        }
      }
    } else if (weaponProps !== undefined) {
      // weapon is added first time to inventory
      inventory.weapons[weaponName] = {
        name: weaponName,
        amount: addAmount,
        damage: setDamage || weapons[weaponName].attack,
        protection: setProtection || weapons[weaponName].defense,
        durability: setDurability,
      };
    } else {
      console.log('adding weapon "' + weaponName + '" to inventory failed');
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
    for (let weaponName in inventory.weapons) {
      if (inventory.weapons[weaponName].amount > 0) {
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
   * @param {string} itemName - Item name
   * @returns {ItemDefinition}
   */
  getItem: function (itemName) {
    return items[itemName] || weapons[itemName];
  },

  /**
   * @returns {Record<string, WeaponProps>}
   */
  getAllInventoryWeapons: function () {
    return inventory.weapons;
  },

  /**
   * @param {string} weaponName - Weapon name
   * @returns {WeaponProps}
   */
  getWeaponFromInventory: function (weaponName) {
    return inventory.weapons[weaponName];
  },

  /**
   * @returns {Record<string, WeaponDefinition>}
   */
  getAllWeapons: function () {
    return weapons;
  },

  /**
   * Get weapon definition by name
   * @param {string} weaponName - Weapon name
   * @returns {WeaponDefinition}
   */
  getWeapon: function (weaponName) {
    return weapons[weaponName];
  },

  /**
   * @param {string} name - Possible weapon name
   * @returns {boolean} True if name is a valid weapon, false otherwise
   */
  isWeapon: function (name) {
    return !!weapons[name];
  },

  /**
   * @param {string} weaponName
   * @returns {WeaponDefinition | Record<string, WeaponDefinition>}
   */
  getWeaponProps: function (weaponName) {
    if (weaponName) {
      return weapons[weaponName];
    } else {
      return weapons;
    }
  },

  /**
   * @param {string} weaponName
   * @returns {WeaponUpgrade | WeaponUpgrades}
   */
  getWeaponPropsUpgrades: function (weaponName) {
    const { weaponPropsUpgrades } = WeaponsDefinitions;
    if (weaponName) {
      return weaponPropsUpgrades[weaponName];
    } else {
      return weaponPropsUpgrades;
    }
  },
};
