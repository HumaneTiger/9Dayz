import Props from './props.js';
import { WeaponsManager, CompanionManager } from './core/index.js';

export default {
  createDurabilityMarkup: function (weaponName, durability) {
    const weaponDefiniton = Props.getWeaponDefinition(weaponName);
    const maxDurabilityChars = '◈'.repeat(weaponDefiniton.durability);
    return (
      '<span class="durability">' +
      maxDurabilityChars.substring(0, durability) +
      '<u>' +
      maxDurabilityChars.substring(0, maxDurabilityChars.length - durability) +
      '</u>' +
      '</span>'
    );
  },

  getDurabilityMarkup: function (itemName) {
    if (Props.isWeapon(itemName)) {
      const inventoryWeapon = WeaponsManager.getWeaponFromInventory(itemName);
      if (inventoryWeapon.durability && inventoryWeapon.durability > 0) {
        return this.createDurabilityMarkup(itemName, inventoryWeapon.durability);
      }
    }
    if (CompanionManager.isCompanion(itemName)) {
      const healthMarkup = CompanionManager.generateHealthMarkup();
      return '<span class="durability">' + healthMarkup + '</span>';
    }
    return '';
  },

  getPictureMarkup: function (itemName) {
    if (Props.isWeapon(itemName)) {
      return '<img class="item-pic" src="./img/weapons/' + itemName + '.png">';
    }
    if (CompanionManager.isCompanion(itemName)) {
      return '<img class="item-pic" src="./img/animals/' + itemName + '-portrait.png">';
    }
    return '<img class="item-pic" src="./img/items/' + itemName + '.PNG">';
  },

  getLastUseMarkup: function (itemName) {
    if (Props.isWeapon(itemName)) {
      /* get weapon from inventory as it contains the actual durability */
      const inventoryWeapon = WeaponsManager.getWeaponFromInventory(itemName);
      return inventoryWeapon.durability === 1
        ? '<img class="last-use" src="./img/weapons/last-use.png">'
        : '';
    }
    if (CompanionManager.isCompanion(itemName)) {
      const companion = CompanionManager.getCompanionFromInventory();
      return companion.health <= 3
        ? '<img class="last-use" src="./img/animals/almost-dead.png">'
        : '';
    }
    return '';
  },
};
