import Props from './props.js';
import Player from './player.js';
import Ui from './ui.js';

const companionContainer = document.getElementById('character');

const slotCompanion = companionContainer.querySelector('.slot-companion');
const companion = Props.getCompanion();

/**
 * Companion module to handle companion interactions
 */

export default {
  init: function () {
    companionContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
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
      companionContainer.classList.add('companion-active');
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
      companionContainer.classList.remove('companion-active');
      slotCompanion.classList.remove('active');
      delete slotCompanion.dataset.item;
    } else {
      companionContainer.classList.remove('companion-active');
      slotCompanion.classList.remove('active');
      delete slotCompanion.dataset.item;
    }
  },

  removeCompanion: function () {
    companion.active = false;
    Props.spawnDoggyAt(Player.getPlayerPosition().x, Player.getPlayerPosition().y, companion);
  },
};
