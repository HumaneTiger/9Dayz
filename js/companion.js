import Props from './props.js';
import Player from './player.js';
import Ui from './ui.js';
import { CompanionManager } from './core/index.js';

const companionContainer = document.getElementById('character');

const slotCompanion = companionContainer.querySelector('.slot-companion');

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

    if (CompanionManager.isCompanionActive() && actionButton && leftMouseButton) {
      const action = actionButton.dataset.action;
      const companionName = slotCompanion.dataset.item;
      if (action === 'leave') {
        this.removeCompanion(companionName);
        this.updateCompanionSlot();
      } else if (action === 'feed') {
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
    if (!CompanionManager.isCompanionActive()) return;
    const companion = CompanionManager.getCompanionFromInventory();
    companion.health += this.getCompanionFoodValue(itemName);
    if (companion.health > companion.maxHealth) {
      companion.health = companion.maxHealth;
    }
    this.updateCompanionSlot();
  },

  updateCompanionSlot: function () {
    const companion = CompanionManager.getCompanionFromInventory();
    if (CompanionManager.isCompanionActive() && companion.health > 0) {
      companionContainer.classList.add('companion-active');
      slotCompanion.classList.add('active');
      slotCompanion.dataset.item = companion.name;
      slotCompanion
        .querySelector('img.motive')
        .setAttribute('src', './img/animals/' + companion.name.toLowerCase() + '.png');
      slotCompanion.querySelector('.attack').textContent = companion.attack;
      /*
      if (companion.defense) {
        slotCompanion.querySelector('.shield').classList.remove('is--hidden');
        slotCompanion.querySelector('.shield').textContent = companion.defense;
      } else {
        slotCompanion.querySelector('.shield').classList.add('is--hidden');
      }*/
      slotCompanion.querySelector('.shield').classList.add('is--hidden');
      const maxHealthChars = '♥'.repeat(companion.maxHealth);
      const health =
        maxHealthChars.substring(0, companion.health) +
        '<u>' +
        maxHealthChars.substring(0, maxHealthChars.length - companion.health) +
        '</u>';
      slotCompanion.querySelector('.distance').innerHTML = health;
    }
    if (CompanionManager.isCompanionActive() && companion.health <= 0) {
      companion.dead = true;
      this.removeCompanion(companion.name);
      companionContainer.classList.remove('companion-active');
      slotCompanion.classList.remove('active');
      delete slotCompanion.dataset.item;
    }
    if (!CompanionManager.isCompanionActive()) {
      companionContainer.classList.remove('companion-active');
      slotCompanion.classList.remove('active');
      delete slotCompanion.dataset.item;
    }
  },

  removeCompanion: function (companionName) {
    const companion = CompanionManager.getCompanionFromInventory();
    if (companionName !== companion.name) {
      console.warn(
        'Attempting to remove companion "' +
          companionName +
          '" but active companion is "' +
          companion.name +
          '"'
      );
      return;
    }
    Props.spawnCompanionAt(
      Player.getPlayerPosition().x,
      Player.getPlayerPosition().y,
      companionName,
      companion
    );
    CompanionManager.removeCompanionFromInventory();
  },
};
