import Props from './props.js';
import Items from './items.js';
import Player from './player.js';
import Audio from './audio.js';
import Events, { EVENTS } from './core/event-manager.js';
import { WeaponsManager } from './core/index.js';

const weaponSlotsContainer = document.getElementById('character');
const slot1 = weaponSlotsContainer.querySelector('.slot-1');
const slot2 = weaponSlotsContainer.querySelector('.slot-2');

export default {
  init: function () {
    weaponSlotsContainer.addEventListener('mouseover', this.checkForSlotHover.bind(this));
    weaponSlotsContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
    // EVENT: React to inventory changes
    Events.on(
      EVENTS.INVENTORY_CHANGED,
      () => {
        this.updateWeaponState();
      },
      {}
    );
    Events.on(
      EVENTS.WEAPON_CHANGED,
      () => {
        this.updateWeaponState();
      },
      {}
    );
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
        this.updateWeaponState();
      }
      Player.updatePlayer();
    } else if (upgradeButton && leftMouseButton) {
      const weaponName = cardSlot.dataset?.item;
      const weaponInstance = Props.getWeaponFromInventory(weaponName);
      const weaponPropsUpgrade = Props.getWeaponPropsUpgrades(weaponName);
      const preserveResources =
        Props.getGameProp('character') === 'craftsmaniac' && Math.random() * 10 <= 2.25
          ? true
          : false;
      if (weaponPropsUpgrade) {
        const upgradeType = this.getUpgradeType(upgradeButton);
        switch (upgradeType) {
          case 'attack-upgrade':
            if (Items.inventoryContains(weaponPropsUpgrade.attack.item)) {
              weaponInstance.damage += weaponPropsUpgrade.attack.amount;
              Audio.sfx('improve-weapon');
              if (!preserveResources) {
                Props.addItemToInventory(weaponPropsUpgrade.attack.item, -1);
              }
            }
            break;
          case 'defense-upgrade':
            weaponInstance.protection += weaponPropsUpgrade.defense.amount;
            Audio.sfx('improve-weapon');
            if (!preserveResources) {
              Props.addItemToInventory(weaponPropsUpgrade.defense.item, -1);
            }
            break;
          case 'durability-upgrade':
            weaponInstance.durability += weaponPropsUpgrade.durability.amount;
            Audio.sfx('repair-weapon');
            if (!preserveResources) {
              Props.addItemToInventory(weaponPropsUpgrade.durability.item, -1);
            }
            break;
          default:
            break;
        }
      }
    }
  },

  updateWeaponSlotUI: function (slot, weaponInstance, weaponName) {
    const maxDurabilityChars = '◈'.repeat(Props.getWeaponProps(weaponName).durability);
    const durability =
      maxDurabilityChars.substring(0, weaponInstance.durability) +
      '<u>' +
      maxDurabilityChars.substring(0, maxDurabilityChars.length - weaponInstance.durability) +
      '</u>';
    slot.querySelector('.distance').innerHTML = durability;
    slot.querySelector('.attack').textContent = weaponInstance.damage;
    slot.querySelector('.shield').textContent = weaponInstance.protection;
    const weaponPropsUpgrade = Props.getWeaponPropsUpgrades(weaponName);
    let changeFeedback = false;
    if (weaponPropsUpgrade !== undefined) {
      const attackUpgrade = slot.querySelector('.attack-upgrade');
      const defenseUpgrade = slot.querySelector('.defense-upgrade');
      const durabilityUpgrade = slot.querySelector('.durability-upgrade');
      if (attackUpgrade && weaponPropsUpgrade.attack) {
        attackUpgrade.querySelector('.attack').textContent = `+${weaponPropsUpgrade.attack.amount}`;
        attackUpgrade.classList.remove('is--hidden');
        attackUpgrade.dataset.item = weaponPropsUpgrade.attack.item;
        if (Items.inventoryContains(weaponPropsUpgrade.attack.item)) {
          if (attackUpgrade.classList.contains('nope')) {
            changeFeedback = true;
          }
          attackUpgrade.classList.remove('nope');
        } else {
          attackUpgrade.classList.add('nope');
        }
      } else {
        attackUpgrade.classList.add('is--hidden');
        delete attackUpgrade.dataset.item;
      }
      if (defenseUpgrade && weaponPropsUpgrade.defense) {
        defenseUpgrade.querySelector('.shield').textContent =
          `+${weaponPropsUpgrade.defense.amount}`;
        defenseUpgrade.classList.remove('is--hidden');
        defenseUpgrade.dataset.item = weaponPropsUpgrade.defense.item;
        if (Items.inventoryContains(weaponPropsUpgrade.defense.item)) {
          if (defenseUpgrade.classList.contains('nope')) {
            changeFeedback = true;
          }
          defenseUpgrade.classList.remove('nope');
        } else {
          defenseUpgrade.classList.add('nope');
        }
      } else {
        defenseUpgrade.classList.add('is--hidden');
        delete defenseUpgrade.dataset.item;
      }
      if (durabilityUpgrade && weaponPropsUpgrade.durability) {
        durabilityUpgrade.classList.remove('is--hidden');
        durabilityUpgrade.dataset.item = weaponPropsUpgrade.durability.item;
        if (Items.inventoryContains(weaponPropsUpgrade.durability.item)) {
          if (Props.getWeaponProps(weaponName).durability > weaponInstance.durability) {
            // upgrade possible
            if (durabilityUpgrade.classList.contains('nope')) {
              changeFeedback = true;
            }
            durabilityUpgrade.querySelector('.durability').textContent = `+◈`;
            durabilityUpgrade.classList.remove('nope');
          } else {
            // upgrade maxed out
            durabilityUpgrade.classList.add('nope');
            durabilityUpgrade.querySelector('.durability').textContent = `MAX`;
          }
        } else {
          durabilityUpgrade.classList.add('nope');
          if (Props.getWeaponProps(weaponName).durability > weaponInstance.durability) {
            durabilityUpgrade.querySelector('.durability').textContent = `+◈`;
          } else {
            // upgrade maxed out
            durabilityUpgrade.querySelector('.durability').textContent = `MAX`;
          }
        }
      } else {
        durabilityUpgrade.classList.add('is--hidden');
        delete durabilityUpgrade.dataset.item;
      }
      if (changeFeedback) {
        // todo: show animation similar to inventory/crafting button
      }
    }
  },

  updateWeaponState: function () {
    const allInventoryWeapons = Props.getAllInventoryWeapons();
    for (let weapon in allInventoryWeapons) {
      const weaponName = allInventoryWeapons[weapon].name;
      // find suitable slot for the weapon in inventory
      if (slot1.classList.contains('active') && slot1.dataset.item === weaponName) {
        if (allInventoryWeapons[weapon].amount > 0) {
          this.updateWeaponSlotUI(slot1, allInventoryWeapons[weapon], weapon);
        } else {
          slot1.classList.remove('active');
        }
      } else if (slot2.classList.contains('active') && slot2.dataset.item === weaponName) {
        if (allInventoryWeapons[weapon].amount > 0) {
          this.updateWeaponSlotUI(slot2, allInventoryWeapons[weapon], weapon);
        } else {
          slot2.classList.remove('active');
        }
      } else {
        let freeSlot;
        if (!slot1.classList.contains('active')) {
          freeSlot = slot1;
          freeSlot.setAttribute('class', 'card weapon slot-1'); // reset
        } else if (!slot2.classList.contains('active')) {
          freeSlot = slot2;
          freeSlot.setAttribute('class', 'card weapon slot-2'); // reset
        }
        if (freeSlot && allInventoryWeapons[weapon].amount > 0) {
          freeSlot.classList.add('active');
          freeSlot.dataset.item = weaponName;
          freeSlot
            .querySelector('img.motive')
            ?.setAttribute('src', './img/weapons/' + weaponName + '.png');
          this.updateWeaponSlotUI(freeSlot, allInventoryWeapons[weapon], weapon);
        }
      }
    }
    if (!slot1.classList.contains('active')) {
      slot2.classList.add('moveToSlot1');
    } else {
      slot2.classList.remove('moveToSlot1');
    }
  },
};
