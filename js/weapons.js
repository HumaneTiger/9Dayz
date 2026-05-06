import Props from './props.js';
import Player from './player.js';
import Audio from './audio.js';
import Character from './character.js';
import { WeaponsManager, CharacterManager, InventoryManager } from './core/index.js';

const weaponSlotsContainer = document.getElementById('character');

export default {
  init: function () {
    weaponSlotsContainer.addEventListener('mouseover', this.checkForSlotHover.bind(this));
    weaponSlotsContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
  },

  // just finds a class among a predefined set
  getUpgradeType: function (element) {
    const classes = ['attack-upgrade', 'defense-upgrade', 'durability-upgrade'];
    return classes.find(cls => element.classList.contains(cls));
  },

  checkForSlotHover: function () {
    return;
  },

  checkForSlotClick: function (ev) {
    const target = ev.target;
    const actionButton = target.closest('div.action-button');
    const upgradeButton = target.closest('div.upgrade:not(.nope)');
    const leftMouseButton = ev.button === 0;
    const cardSlot = target.closest('.card');

    if (actionButton && leftMouseButton) {
      const action = actionButton.dataset.action;
      const weaponName = cardSlot.dataset.item;
      const weaponInstance = Props.getWeaponFromInventory(weaponName);
      const playerPosition = Player.getPlayerPosition();
      if (action === 'unequip' && weaponName && weaponInstance.amount) {
        // re-spawn it at players location
        Props.setupWeapon(playerPosition.x, playerPosition.y, weaponName, {
          attack: weaponInstance.damage,
          defense: weaponInstance.protection,
          durability: weaponInstance.durability,
        });
        WeaponsManager.removeWeaponFromInventory(weaponName);
        Character.updateInventorySlots();
      }
      Player.updatePlayer();
    } else if (upgradeButton && leftMouseButton) {
      const weaponName = cardSlot.dataset?.item;
      const weaponInstance = Props.getWeaponFromInventory(weaponName);
      const weaponPropsUpgrade = Props.getWeaponPropsUpgrades(weaponName);
      if (weaponPropsUpgrade) {
        const upgradeType = this.getUpgradeType(upgradeButton);
        switch (upgradeType) {
          case 'attack-upgrade':
            if (InventoryManager.inventoryContains(weaponPropsUpgrade.attack.item)) {
              weaponInstance.damage += weaponPropsUpgrade.attack.amount;
              Audio.sfx('improve-weapon');
              if (!CharacterManager.shouldPreserveUpgradeResources()) {
                Props.addItemToInventory(weaponPropsUpgrade.attack.item, -1);
              } else {
                // TODO: show some feedback that the upgrade was applied but the resource was preserved (e.g. different sound, visual effect, etc.)
              }
              Character.updateInventorySlots();
            }
            break;
          case 'defense-upgrade':
            weaponInstance.protection += weaponPropsUpgrade.defense.amount;
            Audio.sfx('improve-weapon');
            if (!CharacterManager.shouldPreserveUpgradeResources()) {
              Props.addItemToInventory(weaponPropsUpgrade.defense.item, -1);
            } else {
              // TODO: show some feedback
            }
            Character.updateInventorySlots();
            break;
          case 'durability-upgrade':
            weaponInstance.durability += weaponPropsUpgrade.durability.amount;
            Audio.sfx('repair-weapon');
            if (!CharacterManager.shouldPreserveUpgradeResources()) {
              Props.addItemToInventory(weaponPropsUpgrade.durability.item, -1);
            } else {
              // TODO: show some feedback
            }
            Character.updateInventorySlots();
            break;
          default:
            break;
        }
      }
    }
  },
};
