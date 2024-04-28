import Props from './props.js'
import Items from './items.js'
import Almanac from './almanac.js'

const inventory = Props.getInventory();
const characterContainer = document.getElementById('character');

export default {
  
  init: function() {
    this.bind();
    characterContainer.addEventListener('mouseover', this.checkForSlotHover.bind(this));
    characterContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
  },

  bind: function() {
    return;
  },

  checkForSlotHover: function(ev) {
    return;
  },

  checkForSlotClick: function(ev) {

    const target = ev.target;
    const hoverSlot = target.closest('.slot');    
    const leftMouseButton = (ev.button === 0);
    const rightMouseButton = (ev.button === 2);
    const cardSlot = target.closest('.card');    

    if (cardSlot && rightMouseButton) {
      if (cardSlot.classList.contains('wooden-club')) {
        Almanac.showPage('wooden-club', 'item', cardSlot, characterContainer);
      } else if (cardSlot.classList.contains('improvised-axe')) {
        Almanac.showPage('improvised-axe', 'item', cardSlot, characterContainer);
      } else if (cardSlot.classList.contains('slot-hero')) {
        Almanac.showPage(Props.getGameProp('character'), 'content', cardSlot, characterContainer);
      }
    }
  },

  updateWeaponState: function() {
    // missing: remove slot / weapon
    for (var item in inventory.items) {
      if (inventory.items[item].type === 'extra') {
        const characterContainer = document.getElementById('character');
        const slot1 = characterContainer.querySelector('.slot-1');
        const slot2 = characterContainer.querySelector('.slot-2');
        const weaponName = inventory.items[item].name;
        // find suitable slot for the weapon in inventory
        if (slot1.classList.contains('active') && slot1.classList.contains(weaponName)) {
          if (inventory.items[item].amount > 0) {
            let durability = '◈◈◈'.substring(0, inventory.items[item].durability) + '<u>' +  '◈◈◈'.substring(0, 3 - inventory.items[item].durability) + '</u>';
            slot1.querySelector('.distance').innerHTML = durability;
          } else {
            slot1.classList.remove('active');
          }
        } else if (slot2.classList.contains('active') && slot2.classList.contains(weaponName)) {
          if (inventory.items[item].amount > 0) {
            let durability = '◈◈◈'.substring(0, inventory.items[item].durability) + '<u>' +  '◈◈◈'.substring(0, 3 - inventory.items[item].durability) + '</u>';
            slot2.querySelector('.distance').innerHTML = durability;
          } else {
            slot2.classList.remove('active');
          }
        } else {
          // fill new free slot
          let freeSlot;
          if (!slot1.classList.contains('active')) {
            freeSlot = slot1;
            freeSlot.setAttribute('class', 'card weapon slot-1'); // reset
          } else if(!slot2.classList.contains('active')) {
            freeSlot = slot2;
            freeSlot.setAttribute('class', 'card weapon slot-2'); // reset
          }
          if (freeSlot && inventory.items[item].amount > 0) {
            freeSlot.classList.add('active', weaponName);
            freeSlot.querySelector('img.motive')?.setAttribute('src', './img/weapons/' + weaponName + '.png');
            freeSlot.querySelector('.attack').textContent = inventory.items[item].damage;
            freeSlot.querySelector('.shield').textContent = inventory.items[item].protection;
            let durability = '◈◈◈'.substring(0, inventory.items[item].durability) + '<u>' +  '◈◈◈'.substring(0, 3 - inventory.items[item].durability) + '</u>';
            freeSlot.querySelector('.distance').innerHTML = durability;
          }
        }
      }
    }
  }
}

