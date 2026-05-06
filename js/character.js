import {
  GameState,
  EventManager,
  EVENTS,
  CharacterManager,
  WeaponsManager,
  InventoryManager,
} from './core/index.js';

import TimingUtils from './utils/timing-utils.js';

const characterContainer = document.getElementById('character');

/**
 * Character module to handle character container interactions and character-related UI updates
 */

export default {
  init: function () {
    if (!characterContainer) {
      console.error('Character container not found!');
      return;
    }
    characterContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
    this.addCharacterDescriptionMarkup();
    EventManager.on(
      EVENTS.GAME_PROP_CHANGED,
      ({ prop, value }) => {
        if (prop === 'character') {
          this.updateCharacterName(value);
        }
      },
      { prop: 'character', value: GameState.getGameProp('character') }
    );
    // EVENT: React to inventory changes
    EventManager.on(
      EVENTS.INVENTORY_CHANGED,
      () => {
        this.updateInventorySlots();
      },
      {}
    );
    EventManager.on(
      EVENTS.WEAPON_CHANGED,
      () => {
        this.updateInventorySlots();
      },
      {}
    );
  },

  checkForSlotClick: function () {
    // needed for test player backward compatibility, but currently no character slot interactions
  },

  updateCharacterName: function (characterName) {
    document.getElementById('character').querySelector('.slot-hero h2').textContent = characterName;
  },

  numberFilledSlots: function () {
    return CharacterManager.getNumberFilledSlots();
  },

  addCharacterDescriptionMarkup: function () {
    const allCharacters = CharacterManager.getAllCharacterDefinitions();
    Object.keys(allCharacters).forEach(characterKey => {
      const characterDescriptionContainer = document.querySelector(
        `.screen__2a div[data-character="${characterKey}"]`
      );
      if (characterDescriptionContainer) {
        characterDescriptionContainer.innerHTML = allCharacters[characterKey].descriptionMarkup;
      }
    });
  },

  toggleAxeDurabilityPenalty: function (show = true) {
    let axeSlot = null;
    if (InventoryManager.inventoryContains('improvised-axe')) {
      axeSlot = characterContainer.querySelector('.card.weapon.active[data-item="improvised-axe"]');
    } else if (InventoryManager.inventoryContains('axe')) {
      axeSlot = characterContainer.querySelector('.card.weapon.active[data-item="axe"]');
    }
    if (axeSlot) {
      if (show) {
        axeSlot.classList.add('indicate-change');
        axeSlot.querySelector('.durability-penalty')?.classList.remove('is--hidden');
      } else {
        axeSlot.classList.remove('indicate-change');
        axeSlot.querySelector('.durability-penalty')?.classList.add('is--hidden');
      }
    }
  },

  updateInventorySlots: function () {
    if (!characterContainer) {
      return;
    }
    const allInventoryWeapons = WeaponsManager.getAllInventoryWeapons();
    const slot1 = characterContainer.querySelector('.slot-1');
    const slot2 = characterContainer.querySelector('.slot-2');
    if (!slot1 || !slot2) {
      console.error('Inventory slots not found!');
      return;
    }
    for (let weapon in allInventoryWeapons) {
      const weaponName = allInventoryWeapons[weapon].name;
      // find suitable slot for the weapon in inventory
      if (slot1.classList.contains('active') && slot1.dataset.item === weaponName) {
        if (allInventoryWeapons[weapon].amount > 0) {
          this.updateInventorySlotUI(slot1, allInventoryWeapons[weapon], weapon);
        } else {
          slot1.classList.remove('active');
        }
      } else if (slot2.classList.contains('active') && slot2.dataset.item === weaponName) {
        if (allInventoryWeapons[weapon].amount > 0) {
          this.updateInventorySlotUI(slot2, allInventoryWeapons[weapon], weapon);
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
          this.updateInventorySlotUI(freeSlot, allInventoryWeapons[weapon], weapon);
        }
      }
    }
    if (!slot1.classList.contains('active')) {
      slot2.classList.add('moveToSlot1');
    } else {
      slot2.classList.remove('moveToSlot1');
    }
  },

  updateInventorySlotUI: function (slot, weaponInstance, weaponName) {
    const maxDurabilityChars = '◈'.repeat(WeaponsManager.getWeaponProps(weaponName).durability);
    const durability =
      maxDurabilityChars.substring(0, weaponInstance.durability) +
      '<u>' +
      maxDurabilityChars.substring(0, maxDurabilityChars.length - weaponInstance.durability) +
      '</u>';
    slot.querySelector('.distance').innerHTML = durability;
    slot.querySelector('.attack').textContent = weaponInstance.damage;
    slot.querySelector('.shield').textContent = weaponInstance.protection;
    const weaponPropsUpgrade = WeaponsManager.getWeaponPropsUpgrades(weaponName);
    let changeFeedback = false;
    if (weaponPropsUpgrade !== undefined) {
      const attackUpgrade = slot.querySelector('.attack-upgrade');
      const defenseUpgrade = slot.querySelector('.defense-upgrade');
      const durabilityUpgrade = slot.querySelector('.durability-upgrade');
      if (attackUpgrade && weaponPropsUpgrade.attack) {
        attackUpgrade.querySelector('.attack').textContent = `+${weaponPropsUpgrade.attack.amount}`;
        attackUpgrade.classList.remove('is--hidden');
        attackUpgrade.dataset.item = weaponPropsUpgrade.attack.item;
        if (InventoryManager.inventoryContains(weaponPropsUpgrade.attack.item)) {
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
        if (InventoryManager.inventoryContains(weaponPropsUpgrade.defense.item)) {
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
        if (InventoryManager.inventoryContains(weaponPropsUpgrade.durability.item)) {
          if (WeaponsManager.getWeaponProps(weaponName).durability > weaponInstance.durability) {
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
          if (WeaponsManager.getWeaponProps(weaponName).durability > weaponInstance.durability) {
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
        this.inventorySlotChangeFeedback(slot);
      }
    }
  },

  inventorySlotChangeFeedback: async function (cardRef) {
    cardRef.classList.add('indicate-change');
    await TimingUtils.waitForTransition(cardRef);
    await TimingUtils.wait(100);
    cardRef.classList.remove('indicate-change');
  },
};
