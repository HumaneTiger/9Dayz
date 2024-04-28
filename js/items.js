import Props from './props.js'
import Player from './player.js'
import Ui from './ui.js'
import Cards from './cards.js'
import Crafting from './crafting.js'
import Cooking from './cooking.js'
import Character from './character.js'
import Almanac from './almanac.js'
import Audio from './audio.js'

const items = Props.getAllItems();
const inventory = Props.getInventory();
const inventoryContainer = document.getElementById('inventory');

export default {
  
  init: function() {
    this.bind();
    inventoryContainer.addEventListener('mouseover', this.checkForSlotHover.bind(this));
    inventoryContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
  },

  bind: function() {
  },

  capitalizeFirstLetter: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  inventoryContains: function(item) {
    if (inventory.items[item]?.amount > 0) {
      return true;
    } else if (item === 'drink-1-2') {
      if (inventory.items['drink-1']?.amount > 0 || inventory.items['drink-2']?.amount > 0) {
        return true;
      }  
    } else  if (item === 'mushroom-1-2') {
      if (inventory.items['mushroom-1']?.amount > 0 || inventory.items['mushroom-2']?.amount > 0) {
        return true;
      }        
    }
    return false;
  },

  inventoryKnows: function(item) {
    if (inventory.items[item]) {
      return true;
    } else if (item === 'drink-1-2') {
      if (inventory.items['drink-1'] || inventory.items['drink-2']) {
        return true;
      }  
    } else  if (item === 'mushroom-1-2') {
      if (inventory.items['mushroom-1'] || inventory.items['mushroom-2']) {
        return true;
      }        
    }
    return false;
  },

  inventoryItemAmount: function(item) {
    if (inventory.items[item]) {
      return inventory.items[item].amount;
    } else if (item === 'drink-1-2') {
      return (inventory.items['drink-1']?.amount || 0) + (inventory.items['drink-2']?.amount || 0);
    } else  if (item === 'mushroom-1-2') {
      return (inventory.items['mushroom-1']?.amount || 0) + (inventory.items['mushroom-2']?.amount || 0);
    }
  },

  getFirstItemOfType: function(type) {
    for (var item in inventory.items) {
      if (inventory.items[item].type === type && inventory.items[item].amount) {
        return inventory.items[item];
      }
    }
  },

  getItemByName: function(name) {
    return inventory.items[name];
  },

  inventoryChangeFeedback: function() {
    document.querySelector('#actions .inventory').classList.add('transfer');
    window.setTimeout(function() {
      document.querySelector('#actions .inventory').classList.remove('transfer');
    }, 400);
    Crafting.checkCraftingPrerequisits();
  },

  checkForSlotClick: function(ev) {

    const target = ev.target;
    const hoverSlot = target.closest('.slot');    
    const leftMouseButton = (ev.button === 0);
    const rightMouseButton = (ev.button === 2);

    if (hoverSlot && hoverSlot.classList.contains('active') && leftMouseButton) {
      const item = hoverSlot.dataset.item;
      const itemProps = Props.calcItemProps(item);

      if (itemProps.food > 0) {        
        Player.changeProps('food', itemProps.food);
      }
      if (itemProps.drink > 0) {        
        Player.changeProps('thirst', itemProps.drink);
      }
      if (itemProps.energy > 0) {        
        Player.changeProps('energy', itemProps.energy);
        // with enough new energy, certain actions become unlocked
        Cards.calculateCardDeckProperties();
        Cards.updateCardDeck();
      }
      /* super ugly cross-browser solution forcing an update of the hover-state, forecast stats visualization */
      hoverSlot.style.opacity='0';hoverSlot.style.top='-85px';
      setTimeout(()=>{hoverSlot.style.removeProperty('opacity');hoverSlot.style.removeProperty('top');},0);
      /* /super ugly cross-browser solution forcing an update of the hover-state, forecast stats visualization */
      if (items[item][0] === 'drink') {
        Audio.sfx('drink', 0, 0.7);
      } else if (items[item][0] === 'eat') {
        Audio.sfx('eat-' + Math.floor(Math.random() * (2) + 1), 0, 0.7);
      }
      if (itemProps.food || itemProps.drink || itemProps.energy) {
        Props.addToInventory(item, -1);
        this.fillInventorySlots();
        if (!this.inventoryContains(item)) {
          this.resetInventorySlotHoverEffect();
        }
      }
    }    
    if (hoverSlot && leftMouseButton &&
        hoverSlot.classList.contains('active') &&
        hoverSlot.classList.contains('craft') &&
        hoverSlot.classList.contains('already')) {
      Audio.sfx('click');
      Ui.toggleCrafting();
      document.querySelector('#actions li.craft').classList.remove('transfer');
    }
    if (hoverSlot && hoverSlot.classList.contains('active') && rightMouseButton) {
      const item = hoverSlot.dataset.item;
      Almanac.showPage(item, 'item', hoverSlot, inventoryContainer);
    }
  },

  checkForSlotHover: function(ev) {

    const target = ev.target;
    const hoverSlot = target.closest('.slot');

    if (hoverSlot && !hoverSlot.classList.contains('unknown')) {

      const item = hoverSlot.dataset.item,
            itemActive = hoverSlot.classList.contains('active');

      const action = items[item][0],
            itemProps = Props.calcItemProps(item);

      inventoryContainer.querySelector('p.item-info').innerHTML = this.getItemInfoMarkup(item, itemActive);

      if (action === 'craft' && itemActive) {
        if (Crafting.isItemPartOfCrafting(item)) {
          document.querySelector('#actions li.craft').classList.add('transfer');
        }
      } else {
        Player.resetPreviewProps();
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
    } else {
      this.resetInventorySlotHoverEffect();
    }
  },

  getItemInfoMarkup: function(item, itemActive) {

    const action = items[item][0],
          itemProps = Props.calcItemProps(item),
          itemMods = Props.getItemModifier(Props.getGameProp('character'), item);
    let   itemFood = itemProps.food,
          itemDrink = itemProps.drink,
          itemEnergy = itemProps.energy || 0;

    let itemInfoMarkup = '<span class="name">' + Props.extractItemName(item) + '</span>';
    
    if (itemMods !== undefined && itemMods[0] !== 0) {
      itemFood += '<small>(' + (itemMods[0] > 0 ? '+' + itemMods[0] : itemMods[0]) + ')</small>';
    }
    if (itemMods !== undefined && itemMods[1] !== 0) {
      itemDrink += '<small>(' + (itemMods[1] > 0 ? '+' + itemMods[1] : itemMods[1]) + ')</small>';
    }
    if (itemMods !== undefined && itemMods[2] !== 0) {
      itemEnergy += '<small>(' + (itemMods[2] > 0 ? '+' + itemMods[2] : itemMods[2]) + ')</small>';
    }

    if (action === 'craft' && itemActive) {
      itemInfoMarkup += '<span class="fighting">+<span class="material-symbols-outlined">swords</span></span>';
      if (Crafting.isItemPartOfCrafting(item)) {
        itemInfoMarkup += '<span class="crafting">+<span class="material-symbols-outlined">construction</span></span>';
      }
      if (Cooking.isItemPartOfRecipe(item)) {
        itemInfoMarkup += '<span class="cooking">+<span class="material-symbols-outlined">stockpot</span></span>';
      }
    } else {
      if (itemProps.food > 0 && this.inventoryContains(item)) {
        itemInfoMarkup += '<span class="food">' + itemFood + '<span class="material-symbols-outlined">lunch_dining</span></span>';
      }
      if (itemProps.drink > 0 && this.inventoryContains(item)) {
        itemInfoMarkup += '<span class="drink">' + itemDrink + '<span class="material-symbols-outlined">water_medium</span></span>';
      }
      if (itemProps.energy > 0 && this.inventoryContains(item)) {
        itemInfoMarkup += '<span class="energy">' + itemEnergy + '<span class="material-symbols-outlined">flash_on</span></span>';
      }
      if (Cooking.isItemPartOfRecipe(item) && this.inventoryContains(item)) {
        itemInfoMarkup += '<span class="cooking">+<span class="material-symbols-outlined">stockpot</span></span>';
      }
    }
    return itemInfoMarkup;
  },

  resetInventorySlotHoverEffect: function() {
    inventoryContainer.querySelector('p.item-info').textContent = '';
    document.querySelector('#properties li.food').classList.remove('transfer');
    document.querySelector('#properties li.thirst').classList.remove('transfer');
    document.querySelector('#properties li.energy').classList.remove('transfer');
    document.querySelector('#actions li.craft').classList.remove('transfer');
    document.querySelector('#properties li.food span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.thirst span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.energy span.meter').style.paddingRight = '0';
  },

  generateInventorySlots: function() {
    for (var item in items) {
      if (items[item][0] !== 'extra') {
        inventoryContainer.querySelector('.inner').innerHTML += '<div class="slot unknown '+items[item][0]+' item-'+item+'" data-item="'+item+'"><img src="./img/items/' + item + '.PNG" class="bg"><span class="unknown">?</span><span class="amount"></span><span class="action">' + items[item][0] + '</span></div>';
      }
    }
  },

  fillItemSlot: function(itemSlots, amount, crafting) {
    if (itemSlots) {
      for (let i = 0; i < itemSlots.length; i += 1) {
        const itemSlot = itemSlots[i];
        itemSlot.classList.remove('unknown');
        if (amount > 0) {
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

  fillInventorySlots: function() {
    for (var item in inventory.items) {
      if (inventory.items[item].name === 'improvised-axe' || inventory.items[item].name === 'wooden-club') {
        // maybe remove
      } else {
        this.fillItemSlot(inventoryContainer.querySelectorAll('.slot.item-' + inventory.items[item].name), inventory.items[item].amount, Crafting.isItemPartOfCrafting(item));
      }
    }
    Character.updateWeaponState();
    Cooking.checkAllCookingModeCards();
  }
}