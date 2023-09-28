import Props from './props.js'
import Player from './player.js'
import Crafting from './crafting.js'
import Cooking from './cooking.js'
import Almanac from './almanac.js'
import Audio from './audio.js'

const items = Props.getAllItems();
const inventory = Props.getInventory();
const inventoryContainer = document.getElementById('inventory');

export default {
  
  init: function() {
    Props.addToInventory('tomato', 2);
    Props.addToInventory('drink-2', 1);
    Props.addToInventory('snack-1', 1);
    Props.addToInventory('knife', 1);
    Props.addToInventory('energy-pills', 1);
    Props.addToInventory('pepper', 1);

    // add zero items to present crafting options in Almanac
    Props.addToInventory('tape', 0);
    Props.addToInventory('sharp-stick', 0);
    Props.addToInventory('wooden-club', 0);
    Props.addToInventory('improvised-axe', 0);
    
    /*
    Props.addToInventory('bones', 1);
    Props.addToInventory('cloth', 1);
    Props.addToInventory('mushroom-1', 1);
    Props.addToInventory('sharp-stick', 1);
    Props.addToInventory('bones', 1);
    Props.addToInventory('pumpkin', 1);
    Props.addToInventory('meat', 1);
    */
    /*
    Props.addToInventory('bones', 2);
    Props.addToInventory('hacksaw', 2);
    Props.addToInventory('branch', 2);
    Props.addToInventory('stump', 4);
    Props.addToInventory('straw-wheet', 1);
    Props.addToInventory('pepper', 1);
    */
    this.generateInventorySlots();
    this.fillInventorySlots();

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
      let food = items[item][1];
      let drink = items[item][2];
      let energy = items[item][3];
      if (food > 0) {        
        Player.changeProps('food', food);
      }
      if (drink > 0) {        
        Player.changeProps('thirst', drink);
      }
      if (energy > 0) {        
        Player.changeProps('energy', energy);
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
      if (food || drink || energy) {
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
      document.getElementById('craft').classList.toggle('active');
      document.getElementById('inventory').classList.remove('active');
      document.querySelector('#actions li.craft').classList.remove('transfer');
    }

    if (hoverSlot && hoverSlot.classList.contains('active') && rightMouseButton) {
      const item = hoverSlot.dataset.item;
      Almanac.showPage(item, 'item');
    }
  },

  checkForSlotHover: function(ev) {

    const target = ev.target;
    const hoverSlot = target.closest('.slot');

    if (hoverSlot && !hoverSlot.classList.contains('unknown')) {
      const item = hoverSlot.dataset.item;
      let action = items[item][0];
      let food = items[item][1];
      let drink = items[item][2];
      let energy = items[item][3];
      let itemName = Props.extractItemName(item);
      inventoryContainer.querySelector('p.info').innerHTML = '<span class="name">' + itemName + '</span>';
      if (action === 'craft' && hoverSlot.classList.contains('active')) {
        if (hoverSlot.classList.contains('active')) {
          inventoryContainer.querySelector('p.info').innerHTML += '<span class="fighting">+<span class="material-symbols-outlined">swords</span></span>';
          if (Crafting.isItemPartOfCrafting(item)) {
            inventoryContainer.querySelector('p.info').innerHTML += '<span class="crafting">+<span class="material-symbols-outlined">construction</span></span>';
            document.querySelector('#actions li.craft').classList.add('transfer');
          }
          if (Cooking.isItemPartOfRecipe(item)) {
            inventoryContainer.querySelector('p.info').innerHTML += '<span class="cooking">+<span class="material-symbols-outlined">stockpot</span></span>';
          }
        }
      } else {
        document.querySelector('#properties li.food span.meter').style.paddingRight = '0';
        document.querySelector('#properties li.thirst span.meter').style.paddingRight = '0';
        document.querySelector('#properties li.energy span.meter').style.paddingRight = '0';
        if (food > 0 && this.inventoryContains(item)) {
          inventoryContainer.querySelector('p.info').innerHTML += '<span class="food">' + food + '<span class="material-symbols-outlined">lunch_dining</span></span>';
          document.querySelector('#properties li.food').classList.add('transfer');
          Player.previewProps('food', food);
        }
        if (drink > 0 && this.inventoryContains(item)) {
          inventoryContainer.querySelector('p.info').innerHTML += '<span class="drink">' + drink + '<span class="material-symbols-outlined">water_medium</span></span>';
          document.querySelector('#properties li.thirst').classList.add('transfer');
          Player.previewProps('thirst', drink);
        }
        if (energy > 0 && this.inventoryContains(item)) {
          inventoryContainer.querySelector('p.info').innerHTML += '<span class="energy">' + energy + '<span class="material-symbols-outlined">flash_on</span></span>';
          document.querySelector('#properties li.energy').classList.add('transfer');
          Player.previewProps('energy', energy);
        }
        if (Cooking.isItemPartOfRecipe(item) && this.inventoryContains(item)) {
          inventoryContainer.querySelector('p.info').innerHTML += '<span class="cooking">+<span class="material-symbols-outlined">stockpot</span></span>';
        }
      }
    } else {
      this.resetInventorySlotHoverEffect();
    }
  },

  resetInventorySlotHoverEffect: function() {
    inventoryContainer.querySelector('p.info').textContent = '';
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
        let durability = '◈◈◈'.substring(0, inventory.items[item].durability) + '<u>' + '◈◈◈'.substring(0, 3 - inventory.items[item].durability) + '</u>';
        inventoryContainer.querySelector('.weapon.' + inventory.items[item].name + ' .extension').innerHTML = durability;
        if (inventory.items[item].amount > 0) {
          inventoryContainer.querySelector('.weapon.' + inventory.items[item].name)?.classList.remove('is--hidden');
        } else {
          inventoryContainer.querySelector('.weapon.' + inventory.items[item].name)?.classList.add('is--hidden');
        }
      } else {
        this.fillItemSlot(inventoryContainer.querySelectorAll('.slot.item-' + inventory.items[item].name), inventory.items[item].amount, Crafting.isItemPartOfCrafting(item));
      }
    }
    Cooking.checkAllCookingModeCards();
  }
}