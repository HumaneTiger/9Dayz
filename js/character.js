import Binding from './binding.js';
import Props from './props.js';
import Player from './player.js';
import Items from './items.js';
import Almanac from './almanac.js';
import Ui from './ui.js';
import Audio from './audio.js';
import Events, { EVENTS } from './events.js';

const inventory = Props.getInventory();
const characterContainer = document.getElementById('character');
const slot1 = characterContainer.querySelector('.slot-1');
const slot2 = characterContainer.querySelector('.slot-2');
const slotCompanion = characterContainer.querySelector('.slot-companion');
const companion = Props.getCompanion();

export default {
  init: function () {
    characterContainer.addEventListener('mouseover', this.checkForSlotHover.bind(this));
    characterContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
    this.bind();

    // EVENT: React to inventory changes
    Events.on(EVENTS.INVENTORY_CHANGED, () => {
      this.updateWeaponState();
    });
    Events.on(EVENTS.WEAPON_CHANGED, () => {
      this.updateWeaponState();
    });
  },

  bind: function () {
    new Binding({
      object: Props.getGameProps(),
      property: 'character',
      element: document.getElementById('character').querySelector('.slot-hero h2'),
    });
  },

  checkForSlotHover: function () {
    return;
  },

  toggleCompanionFeedingState: function (isFeeding) {
    if (isFeeding) {
      slotCompanion.classList.add('feeding');
      slotCompanion.querySelector('ul.actions').classList.add('is--hidden');
      Ui.showFeedingInventory();
    } else {
      slotCompanion.classList.remove('feeding');
      slotCompanion.querySelector('ul.actions').classList.remove('is--hidden');
    }
  },

  checkForSlotClick: function (ev) {
    const target = ev.target;
    const actionButton = target.closest('div.action-button');
    const upgradeButton = target.closest('div.upgrade:not(.nope)');
    const leftMouseButton = ev.button === 0;
    const rightMouseButton = ev.button === 2;
    const cardSlot = target.closest('.card');

    if (actionButton && leftMouseButton) {
      const action = actionButton.dataset.action;
      const weaponName = cardSlot.dataset.item;
      const playerPosition = Player.getPlayerPosition();
      if (action === 'unequip' && weaponName && inventory.items[weaponName].amount) {
        // re-spawn it at players location
        Props.setupWeapon(playerPosition.x, playerPosition.y, weaponName, {
          attack: inventory.items[weaponName].damage,
          defense: inventory.items[weaponName].protection,
          durability: inventory.items[weaponName].durability,
        });
        // set weapon amount in inventory to 0 and set durability to 0
        Props.addWeaponToInventory(weaponName, -1, {
          durability: -1 * inventory.items[weaponName].durability,
        });
      } else if (action === 'leave' && companion.active) {
        this.removeCompanion();
        this.updateCompanionSlot();
      } else if (action === 'feed' && companion.active) {
        this.toggleCompanionFeedingState(true);
      }
      Player.updatePlayer();
    } else if (upgradeButton && leftMouseButton) {
      const weapon = cardSlot.dataset?.item;
      const upgradeItem = Props.getWeaponPropsUpgrades(weapon);
      const preserveResources =
        Props.getGameProp('character') === 'craftsmaniac' && Math.random() * 10 <= 2.25
          ? true
          : false;
      if (upgradeItem) {
        if (upgradeButton.classList.contains('attack-upgrade')) {
          if (Items.inventoryContains(upgradeItem.attack.item)) {
            inventory.items[weapon].damage += upgradeItem.attack.amount;
            Audio.sfx('improve-weapon');
            if (!preserveResources) {
              Props.addItemToInventory(upgradeItem.attack.item, -1);
            }
          }
        } else if (upgradeButton.classList.contains('defense-upgrade')) {
          inventory.items[weapon].protection += upgradeItem.defense.amount;
          Audio.sfx('improve-weapon');
          if (!preserveResources) {
            Props.addItemToInventory(upgradeItem.defense.item, -1);
          }
        } else if (upgradeButton.classList.contains('durability-upgrade')) {
          inventory.items[weapon].durability += upgradeItem.durability.amount;
          Audio.sfx('repair-weapon');
          if (!preserveResources) {
            Props.addItemToInventory(upgradeItem.durability.item, -1);
          }
        }
      }
    } else if (cardSlot && rightMouseButton) {
      if (cardSlot.dataset.item === 'improvised-axe' || cardSlot.dataset.item === 'wooden-club') {
        Almanac.showPage(cardSlot.dataset.item, 'item', cardSlot, characterContainer);
      } else if (
        cardSlot.dataset.item === 'axe' ||
        cardSlot.dataset.item === 'baseball-bat' ||
        cardSlot.dataset.item === 'wrench' ||
        cardSlot.dataset.item === 'improvised-whip' ||
        cardSlot.dataset.item === 'fishing-rod' ||
        cardSlot.dataset.item === 'doggy'
      ) {
        Almanac.showPage(cardSlot.dataset.item, 'content', cardSlot, characterContainer);
      } else if (cardSlot.classList.contains('slot-hero')) {
        Almanac.showPage(Props.getGameProp('character'), 'content', cardSlot, characterContainer);
      }
    }
  },

  numberFilledSlots: function () {
    return (
      (slot1.classList.contains('active') ? 1 : 0) + (slot2.classList.contains('active') ? 1 : 0)
    );
  },

  updateWeaponSlot: function (slot, weapon, item) {
    const maxDurabilityChars = '◈'.repeat(Props.getWeaponProps(item).durability);
    const durability =
      maxDurabilityChars.substring(0, weapon.durability) +
      '<u>' +
      maxDurabilityChars.substring(0, maxDurabilityChars.length - weapon.durability) +
      '</u>';
    slot.querySelector('.distance').innerHTML = durability;
    slot.querySelector('.attack').textContent = inventory.items[item].damage;
    slot.querySelector('.shield').textContent = inventory.items[item].protection;
    const upgradeItem = Props.getWeaponPropsUpgrades(item);
    let changeFeedback = false;
    if (upgradeItem !== undefined) {
      const attackUpgrade = slot.querySelector('.attack-upgrade');
      const defenseUpgrade = slot.querySelector('.defense-upgrade');
      const durabilityUpgrade = slot.querySelector('.durability-upgrade');
      if (attackUpgrade && upgradeItem.attack) {
        attackUpgrade.querySelector('.attack').textContent = `+${upgradeItem.attack.amount}`;
        attackUpgrade.classList.remove('is--hidden');
        attackUpgrade.dataset.item = upgradeItem.attack.item;
        if (Items.inventoryContains(upgradeItem.attack.item)) {
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
      if (defenseUpgrade && upgradeItem.defense) {
        defenseUpgrade.querySelector('.shield').textContent = `+${upgradeItem.defense.amount}`;
        defenseUpgrade.classList.remove('is--hidden');
        defenseUpgrade.dataset.item = upgradeItem.defense.item;
        if (Items.inventoryContains(upgradeItem.defense.item)) {
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
      if (durabilityUpgrade && upgradeItem.durability) {
        durabilityUpgrade.classList.remove('is--hidden');
        durabilityUpgrade.dataset.item = upgradeItem.durability.item;
        if (Items.inventoryContains(upgradeItem.durability.item)) {
          if (Props.getWeaponProps(item).durability > inventory.items[item].durability) {
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
          if (Props.getWeaponProps(item).durability > inventory.items[item].durability) {
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

  getCompanionFoodValue: function (itemName) {
    const itemProps = Props.calcItemProps(itemName);
    if (itemName === 'bones') {
      return 2; // bones are always worth 2 food point
    } else if (itemName === 'meat') {
      return 3; // raw meat is always worth 3 food point
    } else if (itemProps && itemProps.food) {
      return Math.round(itemProps.food / 10);
    } else {
      return -1; // not edible for companion
    }
  },

  feedCompanion: function (itemName) {
    if (!companion || !companion.active) return;
    companion.health += this.getCompanionFoodValue(itemName);
    if (companion.health > companion.maxHealth) {
      companion.health = companion.maxHealth;
    }
    this.updateCompanionSlot();
  },

  updateCompanionSlot: function () {
    if (!companion) return;
    if (companion.active && companion.health > 0) {
      characterContainer.classList.add('companion-active');
      slotCompanion.classList.add('active');
      slotCompanion.dataset.item = companion.name;
      slotCompanion
        .querySelector('img.motive')
        .setAttribute('src', './img/animals/' + companion.name.toLowerCase() + '.png');
      slotCompanion.querySelector('.attack').textContent = companion.damage;
      if (companion.protection) {
        slotCompanion.querySelector('.shield').classList.remove('is--hidden');
        slotCompanion.querySelector('.shield').textContent = companion.protection;
      } else {
        slotCompanion.querySelector('.shield').classList.add('is--hidden');
      }
      const maxHealthChars = '♥'.repeat(companion.maxHealth);
      const health =
        maxHealthChars.substring(0, companion.health) +
        '<u>' +
        maxHealthChars.substring(0, maxHealthChars.length - companion.health) +
        '</u>';
      slotCompanion.querySelector('.distance').innerHTML = health;
      /*if (!Props.getGameProp('firstCompanion')) {
        Props.setGameProp('firstCompanion', true);
        Almanac.showPage('doggy', 'content', slotCompanion, characterContainer);
      }*/
    } else if (companion.health <= 0) {
      this.removeCompanion();
      characterContainer.classList.remove('companion-active');
      slotCompanion.classList.remove('active');
      delete slotCompanion.dataset.item;
    } else {
      characterContainer.classList.remove('companion-active');
      slotCompanion.classList.remove('active');
      delete slotCompanion.dataset.item;
    }
  },

  removeCompanion: function () {
    companion.active = false;
    Props.spawnDoggyAt(Player.getPlayerPosition().x, Player.getPlayerPosition().y, companion);
  },

  updateWeaponState: function () {
    for (let item in inventory.items) {
      if (inventory.items[item].type === 'extra') {
        const weaponName = inventory.items[item].name;
        // find suitable slot for the weapon in inventory
        if (slot1.classList.contains('active') && slot1.dataset.item === weaponName) {
          if (inventory.items[item].amount > 0) {
            this.updateWeaponSlot(slot1, inventory.items[item], item);
          } else {
            slot1.classList.remove('active');
          }
        } else if (slot2.classList.contains('active') && slot2.dataset.item === weaponName) {
          if (inventory.items[item].amount > 0) {
            this.updateWeaponSlot(slot2, inventory.items[item], item);
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
          if (freeSlot && inventory.items[item].amount > 0) {
            freeSlot.classList.add('active');
            freeSlot.dataset.item = weaponName;
            freeSlot
              .querySelector('img.motive')
              ?.setAttribute('src', './img/weapons/' + weaponName + '.png');
            this.updateWeaponSlot(freeSlot, inventory.items[item], item);
          }
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
