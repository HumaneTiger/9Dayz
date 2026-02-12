import Events, { EVENTS } from './events.js';
import { ItemsWeaponsDefinitions, CharacterDefinitions } from '../data/index.js';
import ItemUtils from '../data/utils/item-utils.js';

// Destructure items/weapons definitions
const { items } = ItemsWeaponsDefinitions;

var inventory = {
  items: new Array(),
  itemNumbers: 0,
  leftHand: null,
  rightHand: null,
};

var inventoryBatch = {
  active: false,
  oldTotal: 0,
};

export default {
  getInventory: function () {
    return inventory;
  },

  getInventoryItemNumbers: function () {
    return inventory.itemNumbers;
  },

  getInventoryPresets: function (character) {
    return CharacterDefinitions[character]?.inventoryPreset || {};
  },

  /**
   * Begin batching inventory changes
   * Captures current total, multiple adds will emit single event
   */
  beginInventoryBatch: function () {
    inventoryBatch.active = true;
    inventoryBatch.oldTotal = inventory.itemNumbers;
  },

  /**
   * End batching and emit single INVENTORY_CHANGED event
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

  addWeaponToInventory: function (item, addAmount, setWeaponProps) {
    const amount = parseInt(addAmount),
      setDamage = setWeaponProps.damage,
      setProtection = setWeaponProps.protection,
      setDurability = setWeaponProps.durability,
      itemProps = items[item];

    const oldTotal = this.getWeaponTotal();

    if (inventory.items[item] !== undefined) {
      // weapon was added to inventory before
      inventory.items[item].amount += amount;
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
        amount: amount,
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

  getWeaponTotal: function () {
    let total = 0;
    for (let item in inventory.items) {
      if (inventory.items[item].type === 'extra' && inventory.items[item].amount > 0) {
        total += 1;
      }
    }
    return total;
  },

  addItemToInventory: function (item, addAmount) {
    const amount = parseInt(addAmount),
      itemProps = items[item];

    const oldTotal = inventory.itemNumbers;

    if (inventory.items[item] !== undefined) {
      // item was added to inventory before
      inventory.items[item].amount += amount;
      inventory.items[item].amount < 0 ? (inventory.items[item].amount = 0) : false;
    } else if (itemProps !== undefined) {
      // item is added first time to inventory
      inventory.items[item] = {
        type: itemProps[0],
        name: item,
        amount: amount,
        damage: ItemUtils.calcItemDamage(item), // props for battle mode
        protection: ItemUtils.calcItemProtection(item), // props for battle mode
      };
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

  calcItemProps: function (item, character) {
    return ItemUtils.calcItemProps(item, character);
  },

  /* === Item/Weapon Data Accessors === */

  getAllItems: function () {
    return items;
  },

  getItem: function (item) {
    return items[item];
  },

  getWeaponProps: function (itemName) {
    const { weaponProps } = ItemsWeaponsDefinitions;
    if (itemName) {
      return weaponProps[itemName];
    } else {
      return weaponProps;
    }
  },

  getWeaponPropsUpgrades: function (itemName) {
    const { weaponPropsUpgrades } = ItemsWeaponsDefinitions;
    if (itemName) {
      return weaponPropsUpgrades[itemName];
    } else {
      return weaponPropsUpgrades;
    }
  },
};
