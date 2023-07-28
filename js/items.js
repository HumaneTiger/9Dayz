import Props from './props.js'
import Player from './player.js'
import Cards from './cards.js'
import Cooking from './cooking.js'

const items = Props.getAllItems();
const inventory = Props.getInventory();
const crafting = Props.getCrafting();
const inventoryContainer = document.getElementById('inventory');
const craftContainer = document.getElementById('craft');

export default {
  
  init() {
    Props.addToInventory('tomato', 2);
    Props.addToInventory('drink-1', 1);
    Props.addToInventory('snack-1', 1);
    Props.addToInventory('knife', 1);
    Props.addToInventory('energy-pills', 1);
    Props.addToInventory('pepper', 1);

    /*
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
    craftContainer.addEventListener('mouseover', this.checkCraftButtonHover.bind(this));
    craftContainer.addEventListener('mousedown', this.checkCraftButtonClick.bind(this));
    this.checkCraftPrereq();
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
      if (inventory.items['drink-1'] || inventory.items['drink-2'] > 0) {
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

  checkCraftButtonHover: function(ev) {

    const target = ev.target;
    const hoverButton = target.closest('.button-craft');

    if (hoverButton) {
      if (hoverButton.classList.contains('active')) {
        craftContainer.querySelector('p.info').textContent = "Click to " + hoverButton.dataset.action;
      } else if (hoverButton.classList.contains('only1')) {
        craftContainer.querySelector('p.info').textContent = "Can't do - can carry only one";
      } else {
        craftContainer.querySelector('p.info').textContent = "Can't do - items missing";
      }
    } else {
      craftContainer.querySelector('p.info').textContent = "";
    }
  },

  checkCraftButtonClick: function(ev) {
    const target = ev.target;
    const clickButton = target.closest('.button-craft');

    if (clickButton && clickButton.classList.contains('active')) {
      const item = clickButton.dataset.item;
      if (item === 'sharp-stick') {
        Props.addToInventory('sharp-stick', 1);
        Props.addToInventory('branch', -1);
        this.inventoryChangeFeedback();
        this.fillInventorySlots();
      } else if (item === 'fireplace') {
        const here = Player.getPlayerPosition();
        Props.setupBuilding(here.x, here.y, ['fireplace']);
        Cards.renderCardDeck();
        Props.addToInventory('stone', -1);
        Props.addToInventory('stump', -1);
        Props.addToInventory('straw-wheet', -1);
        this.inventoryChangeFeedback();
        this.fillInventorySlots();
        craftContainer.classList.remove('active');
        Player.findAndHandleObjects();
      } else if (item === 'improvised-axe') {
        const here = Player.getPlayerPosition();
        Props.setupWeapon(here.x, here.y, 'improvised-axe');
        Props.addToInventory('stone', -1);
        Props.addToInventory('branch', -1);
        Props.addToInventory('tape', -1);
        this.inventoryChangeFeedback();
        this.fillInventorySlots();
        craftContainer.classList.remove('active');
        Player.findAndHandleObjects();
      } else if (item === 'wooden-club') {
        const here = Player.getPlayerPosition();
        Props.setupWeapon(here.x, here.y, 'wooden-club');
        if (inventory.items['fail']?.amount > 0) {
          Props.addToInventory('fail', -1);
        } else {
          Props.addToInventory('hacksaw', -1);
        }
        Props.addToInventory('stump', -1);
        this.inventoryChangeFeedback();
        this.fillInventorySlots();
        craftContainer.classList.remove('active');
        Player.findAndHandleObjects();
      }
    }
  },

  checkCraftPrereq: function() {
    const here = Player.getPlayerPosition();
    craftContainer.querySelectorAll('.button-craft').forEach((el) => {
      el.classList.remove('active');
      el.classList.remove('only1');
    });
    let totalCrafting = 0;
    // wooden club
    if ((inventory.items['fail']?.amount > 0 || inventory.items['hacksaw']?.amount > 0) && inventory.items['stump']?.amount > 0) {
      if (inventory.items['wooden-club']?.amount) {
        craftContainer.querySelector('.button-craft[data-item="wooden-club"]').classList.add('only1');
      } else {
        craftContainer.querySelector('.button-craft[data-item="wooden-club"]').classList.add('active');
        totalCrafting++;  
      }
    }
    // improvised axe
    if (inventory.items['tape']?.amount > 0 && inventory.items['branch']?.amount > 0 && inventory.items['stone']?.amount > 0) {
      if (inventory.items['improvised-axe']?.amount) {
        craftContainer.querySelector('.button-craft[data-item="improvised-axe"]').classList.add('only1');
      } else {
        craftContainer.querySelector('.button-craft[data-item="improvised-axe"]').classList.add('active');
        totalCrafting++;
      }
    }
    // fireplace
    if (inventory.items['stone']?.amount > 0 && inventory.items['stump']?.amount > 0 && inventory.items['straw-wheet']?.amount > 0) {
      craftContainer.querySelector('.button-craft[data-item="fireplace"]').classList.add('active');
      totalCrafting++;
    }
    // carve
    if (inventory.items['branch']?.amount > 0 && inventory.items['knife']?.amount > 0) {
      craftContainer.querySelector('.button-craft[data-item="sharp-stick"]').classList.add('active');
      totalCrafting++;
    }
    if (totalCrafting !== crafting.total) {
      crafting.total = totalCrafting;
      this.craftingChangeFeedback();
    }
  },

  craftingChangeFeedback: function() {
    document.querySelector('#actions .craft').classList.add('transfer');
    window.setTimeout(function() {
      document.querySelector('#actions .craft').classList.remove('transfer');
    }, 400);
  },

  inventoryChangeFeedback: function() {
    document.querySelector('#actions .inventory').classList.add('transfer');
    window.setTimeout(function() {
      document.querySelector('#actions .inventory').classList.remove('transfer');
    }, 400);
    this.checkCraftPrereq();
  },

  checkForSlotClick: function(ev) {

    const target = ev.target;
    const hoverSlot = target.closest('.slot');

    if (hoverSlot && hoverSlot.classList.contains('active')) {
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
      if (food || drink || energy) {
        Props.addToInventory(item, -1);
        this.fillInventorySlots();
        hoverSlot.parentNode.replaceChild(hoverSlot, hoverSlot);
      }
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
      let itemName = this.capitalizeFirstLetter(item.split('-')[0]);
      if (action === 'craft') {
        inventoryContainer.querySelector('p.info').textContent = 'Use for crafting and fighting';
      } else {
        inventoryContainer.querySelector('p.info').innerHTML = '<span class="name">' + itemName + '</span>';
        document.querySelector('#properties li.food span.meter').style.paddingRight = '0';
        document.querySelector('#properties li.thirst span.meter').style.paddingRight = '0';
        document.querySelector('#properties li.energy span.meter').style.paddingRight = '0';
        if (food > 0 && hoverSlot.classList.contains('active')) {
          inventoryContainer.querySelector('p.info').innerHTML += '<span class="food">' + food + '<span class="material-symbols-outlined">lunch_dining</span></span>';
          document.querySelector('#properties li.food').classList.add('transfer');
          Player.previewProps('food', food);
        }
        if (drink > 0 && hoverSlot.classList.contains('active')) {
          inventoryContainer.querySelector('p.info').innerHTML += '<span class="drink">' + drink + '<span class="material-symbols-outlined">water_medium</span></span>';
          document.querySelector('#properties li.thirst').classList.add('transfer');
          Player.previewProps('thirst', drink);
        }
        if (energy > 0 && hoverSlot.classList.contains('active')) {
          inventoryContainer.querySelector('p.info').innerHTML += '<span class="energy">' + energy + '<span class="material-symbols-outlined">flash_on</span></span>';
          document.querySelector('#properties li.energy').classList.add('transfer');
          Player.previewProps('energy', energy);
        }
      }
    } else {
      inventoryContainer.querySelector('p.info').textContent = '';
      document.querySelector('#properties li.food').classList.remove('transfer');
      document.querySelector('#properties li.thirst').classList.remove('transfer');
      document.querySelector('#properties li.energy').classList.remove('transfer');
      document.querySelector('#properties li.food span.meter').style.paddingRight = '0';
      document.querySelector('#properties li.thirst span.meter').style.paddingRight = '0';
      document.querySelector('#properties li.energy span.meter').style.paddingRight = '0';
    }
  },

  generateInventorySlots: function() {
    for (var item in items) {
      if (items[item][0] !== 'extra') {
        inventoryContainer.querySelector('.inner').innerHTML += '<div class="slot unknown '+items[item][0]+' item-'+item+'" data-item="'+item+'"><img src="./img/items/' + item + '.PNG" class="bg"><span class="unknown">?</span><span class="amount"></span><span class="action">' + items[item][0] + '</span></div>';
      }
    }
  },

  fillItemSlot: function(itemSlots, amount) {
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
        this.fillItemSlot(inventoryContainer.querySelectorAll('.slot.item-' + inventory.items[item].name), inventory.items[item].amount);
      }
    }
    Cooking.checkAllCookingModeCards();
  }
}