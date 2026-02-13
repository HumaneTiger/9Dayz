import Props from './props.js';
import Player from './player.js';
import Ui from './ui.js';
import Events, { EVENTS } from './events.js';

const characterContainer = document.getElementById('character');
const slot1 = characterContainer.querySelector('.slot-1');
const slot2 = characterContainer.querySelector('.slot-2');

const slotCompanion = characterContainer.querySelector('.slot-companion');
const companion = Props.getCompanion();

/**
 * Character module to handle character inventory and companion
 */

/* todo: split into character, companion */

export default {
  init: function () {
    characterContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
    Events.on(
      EVENTS.GAME_PROP_CHANGED,
      ({ prop, value }) => {
        if (prop === 'character') {
          this.updateCharacterName(value);
        }
      },
      { prop: 'character', value: Props.getGameProp('character') }
    );
  },

  checkForSlotClick: function (ev) {
    const target = ev.target;
    const actionButton = target.closest('div.action-button');
    const leftMouseButton = ev.button === 0;

    if (actionButton && leftMouseButton) {
      const action = actionButton.dataset.action;
      if (action === 'leave' && companion.active) {
        this.removeCompanion();
        this.updateCompanionSlot();
      } else if (action === 'feed' && companion.active) {
        this.toggleCompanionFeedingState(true);
      }
      Player.updatePlayer();
    }
  },

  updateCharacterName: function (characterName) {
    document.getElementById('character').querySelector('.slot-hero h2').textContent = characterName;
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

  numberFilledSlots: function () {
    return (
      (slot1.classList.contains('active') ? 1 : 0) + (slot2.classList.contains('active') ? 1 : 0)
    );
  },
};
