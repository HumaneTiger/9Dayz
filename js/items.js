import Props from './props.js';
import Player from './player.js';
import Ui from './ui.js';
import Cards from './cards.js';
import Companion from './companion.js';
import Audio from './audio.js';
import { ItemUtils } from '../data/index.js';
import TimingUtils from './utils/timing-utils.js';
import {
  EventManager,
  EVENTS,
  RecipesManager,
  InventoryManager,
  CharacterManager,
} from './core/index.js';

const items = Props.getAllItems();
const inventory = Props.getInventory();
const inventoryContainer = document.getElementById('inventory');

export default {
  init: function () {
    inventoryContainer.addEventListener('mouseover', this.checkForSlotHover.bind(this));
    inventoryContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
    // EVENT: React to inventory changes and trigger callback imimediately
    EventManager.on(
      EVENTS.INVENTORY_CHANGED,
      ({ oldTotal, newTotal }) => {
        this.fillInventorySlots();
        if (oldTotal !== newTotal) {
          this.inventoryChangeFeedback();
        }
      },
      { oldTotal: 0, newTotal: inventory.itemNumbers }
    );
  },

  capitalizeFirstLetter: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  inventoryContains: function (itemName) {
    return InventoryManager.inventoryContains(itemName);
  },

  inventoryKnows: function (itemName) {
    return InventoryManager.inventoryKnows(itemName);
  },

  inventoryItemAmount: function (itemName) {
    return InventoryManager.inventoryItemAmount(itemName);
  },

  getItemByName: function (itemName) {
    return InventoryManager.getItemByName(itemName);
  },

  getFirstItemOfType: function (itemType) {
    return InventoryManager.getFirstItemOfType(itemType);
  },

  inventoryChangeFeedback: async function () {
    document.getElementById('inventory-numbers').textContent = inventory.itemNumbers;
    document.querySelector('#actions .inventory').classList.add('transfer');
    await TimingUtils.waitForTransition(document.querySelector('#actions .inventory'));
    await TimingUtils.wait(100);
    document.querySelector('#actions .inventory').classList.remove('transfer');
  },

  checkForSlotClick: function (ev) {
    const target = ev.target;
    const hoverSlot = target.closest('.slot');
    const leftMouseButton = ev.button === 0;

    if (hoverSlot && hoverSlot.classList.contains('active') && leftMouseButton) {
      const item = hoverSlot.dataset.item;
      const itemProps = Props.calcItemProps(item);

      if (!Props.getGameProp('feedingCompanion')) {
        if (itemProps.food > 0) {
          Props.changePlayerProp('food', itemProps.food);
        }
        if (itemProps.drink > 0) {
          Props.changePlayerProp('thirst', itemProps.drink);
        }
        if (itemProps.energy > 0) {
          Props.changePlayerProp('energy', itemProps.energy);
          // with enough new energy, certain actions become unlocked
          Cards.calculateCardDeckProperties();
          Cards.updateCardDeck();
        }
        /* not so ugly cross-browser solution forcing an update of the hover-state, forecast stats visualization */
        hoverSlot.style.pointerEvents = 'none';
        setTimeout(() => {
          hoverSlot.style.removeProperty('pointer-events');
        }, 0);
        /* /not so ugly cross-browser solution forcing an update of the hover-state, forecast stats visualization */
        if (items[item][0] === 'drink') {
          Audio.sfx('drink', 0, 0.7);
        } else if (items[item][0] === 'eat') {
          Audio.sfx('eat-' + Math.floor(Math.random() * 2 + 1), 0, 0.7);
        }
        if (itemProps.food || itemProps.drink || itemProps.energy) {
          Props.addItemToInventory(item, -1);
          if (!this.inventoryContains(item)) {
            this.resetInventorySlotHoverEffect();
          }
        }
      } else {
        Audio.sfx('eat-' + Math.floor(Math.random() * 2 + 1), 0, 0.7);
        Companion.feedCompanion(item, itemProps.food);
        Props.addItemToInventory(item, -1);
        if (!this.inventoryContains(item)) {
          this.resetInventorySlotHoverEffect();
        }
      }
    }
    if (
      hoverSlot &&
      leftMouseButton &&
      hoverSlot.classList.contains('active') &&
      hoverSlot.classList.contains('craft') &&
      hoverSlot.classList.contains('already') &&
      !Props.getGameProp('feedingCompanion')
    ) {
      Audio.sfx('click');
      Ui.toggleCrafting();
      document.querySelector('#actions li.craft').classList.remove('transfer');
    }
  },

  checkForSlotHover: function (ev) {
    const target = ev.target;
    const hoverSlot = target.closest('.slot');

    if (hoverSlot && !hoverSlot.classList.contains('unknown')) {
      const item = hoverSlot.dataset.item,
        itemActive = hoverSlot.classList.contains('active');

      const action = items[item][0],
        itemProps = Props.calcItemProps(item);

      inventoryContainer.querySelector('p.item-info').innerHTML = this.getItemInfoMarkup(
        item,
        itemActive
      );

      if (action === 'craft' && itemActive) {
        if (RecipesManager.isItemPartOfCraftingRecipe(item)) {
          document.querySelector('#actions li.craft').classList.add('transfer');
        }
      } else {
        Player.resetPreviewProps();
        if (!Props.getGameProp('feedingCompanion')) {
          if (itemProps.food > 0 && this.inventoryContains(item)) {
            document.querySelector('#properties li.food').classList.add('transfer');
            Player.previewProps('food', itemProps.food);
          }
          if (itemProps.drink > 0 && this.inventoryContains(item)) {
            document.querySelector('#properties li.thirst').classList.add('transfer');
            Player.previewProps('thirst', itemProps.drink);
          }
          if (itemProps.energy > 0 && this.inventoryContains(item)) {
            document.querySelector('#properties li.energy').classList.add('transfer');
            Player.previewProps('energy', itemProps.energy);
          }
        }
      }
    } else {
      this.resetInventorySlotHoverEffect();
    }
  },

  getItemInfoMarkup: function (itemName, itemActive) {
    const item = Props.isWeapon(itemName)
      ? Props.getWeaponFromInventory(itemName)
      : Props.getItemFromInventory(itemName);
    if (!item) {
      console.log('Item not found in inventory:', itemName);
      return '';
    }

    const action = item.type || '',
      itemMods = CharacterManager.getItemModifier(Props.getGameProp('character'), item);
    let itemFood = item.food,
      itemDrink = item.drink,
      itemEnergy = item.energy || 0;

    let itemInfoMarkup = Props.getGameProp('feedingCompanion')
      ? `<span class="name">Feeding ${ItemUtils.extractItemName(itemName)} gives</span>`
      : `<span class="name">${ItemUtils.extractItemName(itemName)}</span>`;

    if (!Props.getGameProp('feedingCompanion')) {
      if (itemMods !== undefined && itemMods[0] !== 0) {
        itemFood += `<small>(${itemMods[0] > 0 ? '+' + itemMods[0] : itemMods[0]})</small>`;
      }
      if (itemMods !== undefined && itemMods[1] !== 0) {
        itemDrink += `<small>(${itemMods[1] > 0 ? '+' + itemMods[1] : itemMods[1]})</small>`;
      }
      if (itemMods !== undefined && itemMods[2] !== 0) {
        itemEnergy += `<small>(${itemMods[2] > 0 ? '+' + itemMods[2] : itemMods[2]})</small>`;
      }

      if (action === 'craft' && itemActive) {
        itemInfoMarkup +=
          '<span class="fighting">+<span class="material-symbols-outlined">swords</span></span>';
        if (RecipesManager.isItemPartOfCraftingRecipe(item)) {
          itemInfoMarkup +=
            '<span class="crafting">+<span class="material-symbols-outlined">construction</span></span>';
        }
        if (RecipesManager.isItemPartOfRecipe(item)) {
          itemInfoMarkup +=
            '<span class="cooking">+<span class="material-symbols-outlined">stockpot</span></span>';
        }
      } else {
        if (item.food > 0 && this.inventoryContains(itemName)) {
          itemInfoMarkup += `<span class="food">${itemFood}<span class="material-symbols-outlined">lunch_dining</span></span>`;
        }
        if (item.drink > 0 && this.inventoryContains(itemName)) {
          itemInfoMarkup += `<span class="drink">${itemDrink}<span class="material-symbols-outlined">water_medium</span></span>`;
        }
        if (item.energy > 0 && this.inventoryContains(itemName)) {
          itemInfoMarkup += `<span class="energy">${itemEnergy}<span class="material-symbols-outlined">flash_on</span></span>`;
        }
        if (RecipesManager.isItemPartOfRecipe(itemName) && this.inventoryContains(itemName)) {
          itemInfoMarkup +=
            '<span class="cooking">+<span class="material-symbols-outlined">stockpot</span></span>';
        }
      }
    } else {
      if (Companion.getCompanionFoodValue(itemName) !== -1 && this.inventoryContains(itemName)) {
        itemInfoMarkup += `<span class="food">${Companion.getCompanionFoodValue(itemName)}
              <span class="material-symbols-outlined">favorite</span></span>`;
      }
    }

    return itemInfoMarkup;
  },

  resetInventorySlotHoverEffect: function () {
    inventoryContainer.querySelector('p.item-info').textContent = '';
    document.querySelector('#properties li.food').classList.remove('transfer');
    document.querySelector('#properties li.thirst').classList.remove('transfer');
    document.querySelector('#properties li.energy').classList.remove('transfer');
    document.querySelector('#actions li.craft').classList.remove('transfer');
    document.querySelector('#properties li.food span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.thirst span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.energy span.meter').style.paddingRight = '0';
  },

  generateInventorySlots: function () {
    for (const item in items) {
      inventoryContainer.querySelector('.inner').insertAdjacentHTML(
        'beforeend',
        `<div class="slot unknown ${items[item][0]} item-${item}" data-item="${item}">
            <img src="./img/items/${item}.PNG" class="bg">
            <span class="unknown">?</span>
            <span class="amount"></span>
            <span class="action">${items[item][0]}</span>
          </div>`
      );
    }
  },

  fillItemSlot: function (itemSlots, amount, crafting, itemProps) {
    if (itemSlots) {
      for (let i = 0; i < itemSlots.length; i += 1) {
        const itemSlot = itemSlots[i];
        itemSlot.classList.remove('unknown');
        if (Props.getGameProp('feedingCompanion')) {
          if ((itemProps?.food > 0 || itemProps.name === 'bones') && amount > 0) {
            itemSlot.classList.remove('inactive');
            itemSlot.classList.add('active');
            itemSlot.querySelector('.amount').textContent = amount;
          } else {
            itemSlot.classList.remove('active');
            itemSlot.classList.add('inactive');
          }
        } else if (amount > 0) {
          itemSlot.classList.remove('inactive');
          itemSlot.classList.add('active');
          itemSlot.querySelector('.amount').textContent = amount;
        } else {
          itemSlot.querySelector('.amount').textContent = '';
          itemSlot.classList.remove('active');
          itemSlot.classList.add('inactive');
        }
        if (crafting) {
          itemSlot.classList.add('already');
        } else {
          itemSlot.classList.remove('already');
        }
      }
    }
  },

  fillInventorySlots: function () {
    for (const item in inventory.items) {
      this.fillItemSlot(
        inventoryContainer.querySelectorAll(`.slot.item-${inventory.items[item].name}`),
        inventory.items[item].amount,
        RecipesManager.isItemPartOfCraftingRecipe(item),
        Props.calcItemProps(item)
      );
    }
  },
};
