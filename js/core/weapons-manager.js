// @ts-check
/**
 * @import { WeaponDefinition, WeaponProps, WeaponUpgrade, WeaponUpgrades } from '../../data/definitions/weapons-definitions.js'
 * @import { Inventory } from './inventory-manager.js'
 */

import { WeaponsDefinitions } from '../../data/index.js';
import { InventoryManager, EventManager, EVENTS } from './index.js';

/** @type {Record<string, WeaponDefinition>} */
const weapons = WeaponsDefinitions.weapons;

/** @type {Inventory} */
const inventory = InventoryManager.getInventory();

export default {
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
          // reset weapon props
          inventory.weapons[weaponName].damage = weapons[weaponName].attack;
          inventory.weapons[weaponName].protection = weapons[weaponName].defense;
          // remove from inventory
          this.removeWeaponFromInventory(weaponName);
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
    if (!InventoryManager.isInventoryBatchActive() && oldTotal !== newTotal) {
      EventManager.emit(EVENTS.WEAPON_CHANGED, {
        oldTotal: oldTotal,
        newTotal: newTotal,
      });
    }
  },

  /**
   * @param {string} weaponName
   */
  removeWeaponFromInventory: function (weaponName) {
    // only if weapon was added to inventory before
    if (inventory.weapons[weaponName] !== undefined) {
      inventory.weapons[weaponName].amount = 0;
      inventory.weapons[weaponName].durability = 0;
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
  getWeaponDefinition: function (weaponName) {
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
