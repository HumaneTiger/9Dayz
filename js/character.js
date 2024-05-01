import Props from './props.js'
import Player from './player.js'
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
    const actionButton = target.closest('div.action-button');
    const leftMouseButton = (ev.button === 0);
    const rightMouseButton = (ev.button === 2);
    const cardSlot = target.closest('.card');    

    if (actionButton && leftMouseButton) {
      const action = actionButton.dataset.action;
      const weaponName = cardSlot.dataset.item;
      const playerPosition = Player.getPlayerPosition();
      if (action === 'unequip' && weaponName && inventory.items[weaponName].amount) {
        // re-spawn it at players location
        Props.setupWeapon(playerPosition.x, playerPosition.y, weaponName,
        {
          attack: inventory.items[weaponName].damage,
          defense: inventory.items[weaponName].protection,
          durability: inventory.items[weaponName].durability
        });
        // set weapon amount in inventory to 0 and set durability to 0
        Props.addToInventory(weaponName, -1, -1 * inventory.items[weaponName].durability);
        Items.inventoryChangeFeedback();
      }
      this.updateWeaponState();
      Player.updatePlayer();
    } else if (cardSlot && rightMouseButton) {
      if (cardSlot.dataset.item === 'improvised-axe' || cardSlot.dataset.item === 'wooden-club') {
        Almanac.showPage(cardSlot.dataset.item, 'item', cardSlot, characterContainer);
      } else if (cardSlot.dataset.item === 'axe' || cardSlot.dataset.item === 'baseball-bat' || cardSlot.dataset.item === 'wrench') {
        Almanac.showPage(cardSlot.dataset.item, 'content', cardSlot, characterContainer);
      } else if (cardSlot.classList.contains('slot-hero')) {
        Almanac.showPage(Props.getGameProp('character'), 'content', cardSlot, characterContainer);
      }
    }
  },

  numberFilledSlots: function() {
    const slot1 = characterContainer.querySelector('.slot-1.active');
    const slot2 = characterContainer.querySelector('.slot-2.active');
    return (slot1 ? 1 : 0) + (slot2 ? 1 : 0);
  },

  updateWeaponState: function() {
    const characterContainer = document.getElementById('character');
    const slot1 = characterContainer.querySelector('.slot-1');
    const slot2 = characterContainer.querySelector('.slot-2');
    for (var item in inventory.items) {
      if (inventory.items[item].type === 'extra') {
        const weaponName = inventory.items[item].name;
        // find suitable slot for the weapon in inventory
        if (slot1.classList.contains('active') && slot1.dataset.item === weaponName) {
          if (inventory.items[item].amount > 0) {
            let durability = '◈◈◈'.substring(0, inventory.items[item].durability) + '<u>' +  '◈◈◈'.substring(0, 3 - inventory.items[item].durability) + '</u>';
            slot1.querySelector('.distance').innerHTML = durability;
          } else {
            slot1.classList.remove('active');
          }
        } else if (slot2.classList.contains('active') && slot2.dataset.item === weaponName) {
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
            freeSlot.classList.add('active');
            freeSlot.dataset.item = weaponName;
            freeSlot.querySelector('img.motive')?.setAttribute('src', './img/weapons/' + weaponName + '.png');
            freeSlot.querySelector('.attack').textContent = inventory.items[item].damage;
            freeSlot.querySelector('.shield').textContent = inventory.items[item].protection;
            let durability = '◈◈◈'.substring(0, inventory.items[item].durability) + '<u>' +  '◈◈◈'.substring(0, 3 - inventory.items[item].durability) + '</u>';
            freeSlot.querySelector('.distance').innerHTML = durability;
          }
        }
      }
    }
    if (!slot1.classList.contains('active')) {
      slot2.classList.add('moveToSlot1');
    } else {
      slot2.classList.remove('moveToSlot1');
    }
  }
}

