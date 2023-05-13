import Audio from './audio.js'
import Binding from './binding.js'
import Props from './props.js'
import Player from './player.js'
import Cards from './cards.js'
import Map from './map.js'

const items = Props.getAllItems();
const inventory = Props.getInventory();
const crafting = Props.getCrafting();
const inventoryContainer = document.getElementById('inventory');
const craftContainer = document.getElementById('craft');
const battleDrawContainer = document.querySelector('#battle-cards .draw');
const battlePlayContainer = document.querySelector('#battle-cards .play');
const battleHealthMeter = document.querySelector('#properties li.health');

let battleDeck = [];
let battleDeckProps = {
  number: 0
};

export default {
  
  init() {
    Props.addToInventory('tomato', 2);
    Props.addToInventory('drink-1', 1);
    Props.addToInventory('snack-1', 1);
    Props.addToInventory('knife', 1);
    
    Props.addToInventory('stone', 2);
    Props.addToInventory('tape', 2);
    Props.addToInventory('branch', 2);
    Props.addToInventory('stump', 1);
    Props.addToInventory('straw-wheet', 1);
    Props.addToInventory('pepper', 1);
    

    this.generateInventorySlots();
    this.fillInventorySlots();

    this.bind();
    inventoryContainer.addEventListener('mouseover', this.checkForSlotHover.bind(this));
    inventoryContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
    craftContainer.addEventListener('mouseover', this.checkCraftButtonHover.bind(this));
    craftContainer.addEventListener('mousedown', this.checkCraftButtonClick.bind(this));
    document.querySelector('#battle-cards .end-turn').addEventListener('click', this.endTurn.bind(this));
    this.checkCraftPrereq();
  },

  bind: function() {
    new Binding({
      object: battleDeckProps,
      property: 'number',
      element: document.getElementById('draw-amount')
    })
  },

  capitalizeFirstLetter: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  inventoryContains: function(item) {
    if (inventory.items[item]?.amount > 0) {
      return true;
    }
    return false;
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
      if (item === 'meat') {
        Props.addToInventory('meat', 3);
        Props.addToInventory('duck', -1);
        this.inventoryChangeFeedback();
        this.fillInventorySlots();
      } else if (item === 'roast') {
        if (inventory.items['meat']?.amount > 0) {
          Props.addToInventory('roasted-meat', 1);
          Props.addToInventory('meat', -1);
        }
        if (inventory.items['pepper']?.amount > 0) {
          Props.addToInventory('roasted-pepper', 1);
          Props.addToInventory('pepper', -1);
        }
        if (inventory.items['mushroom-2']?.amount > 0) {
          Props.addToInventory('roasted-mushroom', 1);
          Props.addToInventory('mushroom-2', -1);
        }
        this.inventoryChangeFeedback();
        this.fillInventorySlots();
      } else if (item === 'fireplace') {
        const here = Player.getPlayerPosition();
        let success = Props.setupBuilding(here.x, here.y, ['fireplace']);
        if (success) {
          Player.handleFoundBuildings(here.x, here.y);
          Cards.updateCardDeck();
          Props.addToInventory('stone', -1);
          Props.addToInventory('stump', -1);
          Props.addToInventory('straw-wheet', -1);
          this.inventoryChangeFeedback();
          this.fillInventorySlots();
        } else {
          craftContainer.querySelector('p.info').textContent = "Place occupied. Can't build here!";
        }
      } else if (item === 'improvised-axe') {
        if (inventory.items['improvised-axe'] === undefined || inventory.items['improvised-axe'].amount === 0) {
          Props.addToInventory('stone', -1);
          Props.addToInventory('branch', -1);
          Props.addToInventory('tape', -1);
          Props.addToInventory('improvised-axe', 1, 3);
          this.inventoryChangeFeedback();
          this.fillInventorySlots();
          Cards.updateCardDeck();
        }
      } else if (item === 'wooden-club') {
        if (inventory.items['wooden-club'] === undefined || inventory.items['wooden-club'].amount === 0) {
          if (inventory.items['fail']?.amount > 0) {
            Props.addToInventory('fail', -1);
          } else {
            Props.addToInventory('hacksaw', -1);
          }
          Props.addToInventory('stump', -1);
          Props.addToInventory('wooden-club', 1, 3);
          this.inventoryChangeFeedback();
          this.fillInventorySlots();
          Cards.updateCardDeck();
        }
      }
    }
  },

  shuffle: function (array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  },

  startBattle(surprised, singleZed) {
    let cardDeck = Cards.getCardDeck();
    let fightingZombies = [];
    const spaceX = 400;

    if (singleZed) {
      fightingZombies.push(singleZed.dataset.name +'-'+ singleZed.dataset.x +'-'+ singleZed.dataset.y);
    } else {
      for (const card in cardDeck) {
        if (cardDeck[card].type === 'zombie' && cardDeck[card].dist < 2.9) {
          fightingZombies.push(cardDeck[card].name +'-'+ cardDeck[card].x +'-'+ cardDeck[card].y);
        }
      }  
    }
    if (fightingZombies.length > 0) {
      for (var i = 0; i < fightingZombies.length; i += 1)  {
        let zombie = document.querySelector('#cards .card.zombie.' + fightingZombies[i]);
        zombie.classList.add('fight');
        zombie.style.zIndex = 220;
        zombie.style.left = (2135/2) - (fightingZombies.length * spaceX / 2) + (i * spaceX) + 'px';
      }
      document.getElementById('inventory').classList.remove('active');
      document.getElementById('craft').classList.remove('active');
      document.querySelector('#cards .cards-blocker').classList.remove('is--hidden');
      window.setTimeout(function(surprised) {
        document.getElementById('properties').classList.remove('active');
        document.getElementById('actions').classList.remove('active');
        document.querySelector('#cards .cards-blocker').classList.add('active');
        this.spawnBattleDeck(surprised);
      }.bind(this), 100, surprised);  
    }
  },

  spawnBattleDeck: function(surprised) {

    for (const item in inventory.items) {
      for (var i = 0; i < inventory.items[item].amount; i += 1) {
        battleDeck.push(inventory.items[item]);
      }
    }
    for (const item in battleDeck) {
      battleDrawContainer.innerHTML += '<div class="battle-card-back" style="left: ' + (item * 4) + 'px"></div>';
    }
    document.getElementById('draw-amount').style.left = (200 + battleDeck.length * 4) + 'px';
    battleDrawContainer.style.width = (160 + battleDeck.length * 4) + 'px';

    battleHealthMeter.classList.add('in-battle');

    if (surprised) {
      document.querySelector('#battle-cards .end-turn').classList.add('is--hidden');
      document.getElementById('battle-cards').classList.remove('is--hidden');
      this.showBattleMessage('Oh no! You walked into them!', 2000);
      window.setTimeout(function() {
        this.zedAttack();
      }.bind(this), 600);  
    } else {
      this.nextTurn();
    }
  },

  endBattle: function() {
    battleDeck = [];
    // Battle UI
    document.getElementById('battle-cards').classList.add('is--hidden');
    battleDrawContainer.innerHTML = '';
    battlePlayContainer.innerHTML = '';
    document.getElementById('draw-amount').style.left = '0';
    battleDrawContainer.style.width = '';
    // UI
    battleHealthMeter.classList.remove('in-battle');
    document.getElementById('properties').classList.add('active');
    document.getElementById('actions').classList.add('active');
    document.querySelector('#cards .cards-blocker').classList.remove('active');
    Player.lockMovement(false);
    window.setTimeout(function() {
      const allAttackingZeds = document.querySelectorAll('#cards .card.zombie.fight');
      document.querySelector('#cards .cards-blocker').classList.add('is--hidden');
      allAttackingZeds.forEach(zed => {
        zed.classList.remove('fight');
        zed.querySelector('.actions li.lure')?.remove();
        zed.querySelector('.actions li.attackz')?.remove();
        zed.querySelector('.actions li.search')?.classList.remove('is--hidden');
      });
      Cards.updateCardDeck();
    }.bind(this), 100);
  },

  nextTurn: function() {
    Player.changeProps('protection', -100);
    Player.changeProps('actions', -100);
    Player.changeProps('actions', 3);

    document.querySelector('#action-points-warning .very-low')?.classList.add('is--hidden');
    document.querySelector('#action-points-warning .low')?.classList.add('is--hidden');
    document.querySelector('#action-points')?.classList.remove('low-energy');

    if (Player.getProp('energy') < 10) {
      Player.changeProps('actions', -2);
      document.querySelector('#action-points-warning .very-low')?.classList.remove('is--hidden');
      document.querySelector('#action-points')?.classList.add('low-energy');
    } else if (Player.getProp('energy') < 33) {
      Player.changeProps('actions', -1);
      document.querySelector('#action-points-warning .low')?.classList.remove('is--hidden');
      document.querySelector('#action-points')?.classList.add('low-energy');
    }
    this.shuffle(battleDeck);
    battlePlayContainer.innerHTML = '';
    let maxItems = 5;
    if (battleDeck.length < 5) maxItems = battleDeck.length;
    if (maxItems > 0) {
      document.querySelector('#battle-cards .end-turn').classList.remove('is--hidden');
      for (var i = 0; i < maxItems; i += 1) {
        let dmg, prot;
        const item = items[battleDeck[i].name];
        if (item) {
          dmg = item[4] ? item[4] : 1 + Math.round(item[3] / 10);
          if (item[5]) {
            prot = item[5];
          } else {
            prot = item[1] > item[2] ? Math.round(item[1] / 10) : Math.round(item[2] / 10);
          }
  
          battlePlayContainer.innerHTML += '<div class="battle-card inactive" data-item="'+battleDeck[i].name+'"><div class="inner">' +
                                          '<img class="item-pic" src="./img/items/'+battleDeck[i].name+'.PNG">' +
                                          '<div class="attack">'+dmg+'</div><div class="shield">'+prot+'</div>' +
                                          '</div></div>';
        }
      }
      document.getElementById('battle-cards').classList.remove('is--hidden');
      for (var i = 0; i < battlePlayContainer.children.length; i += 1) {
        window.setTimeout(function(index, child, totalCards) {
          child.style.left = (index * 170) + 'px';
          child.classList.remove('inactive');
          battleDeckProps.number = totalCards + index;
        }, 500 + i * 300, battlePlayContainer.children.length - i - 1, battlePlayContainer.children[i], battleDeck.length-battlePlayContainer.children.length);
      }  
    } else {
      this.endTurn();
    }
  },

  resolveAttack: function(dragEl, dragTarget) {
    var item = dragEl.dataset.item;
    var attack = parseInt(dragEl.querySelector('.attack').textContent);
    var defense = parseInt(dragEl.querySelector('.shield').textContent);
    var zHealth = parseInt(dragTarget.querySelector('.health').textContent);
    let scratch = document.querySelector('.scratch');

    Player.changeProps('protection', defense);
    Player.changeProps('actions', -1);
    this.showBattleStats('+'+defense, 'blue');
    Audio.sfx('punch');

    zHealth -= attack;
    if (zHealth <= 0) {
      dragTarget.classList.add('dead');
    } else {
      dragTarget.querySelector('.health').textContent = zHealth;
    }

    // REAL mode
    if (Props.getGameMode() === 'real') {
      if (inventory.items[item].durability && inventory.items[item].durability > 0) {
        inventory.items[item].durability -= 1;
      }
      if (!inventory.items[item].durability) {
        //remove item from inventory
        Props.addToInventory(item, -1);
        //remove item from battle deck
        for (var i = 0; i < battleDeck.length; i += 1) {
          if (battleDeck[i].name === inventory.items[item].name) {
            battleDeck.splice(i, 1);
            break;
          }
        }
      }
      // check if any items are left
      if (battleDeck.length === 0) {
        this.showBattleMessage('No items left.<br>End turn to seal your fate...', 2000);
      }
      this.fillInventorySlots();
    } else {
      battleDeckProps.number += 1;
    }

    // play "hit" animation, resolve item card
    scratch.style.left = dragTarget.style.left;
    scratch.classList.add('anim-scratch');
    dragTarget.classList.add('shake');
    dragEl.classList.add('resolve');

    // cleanup
    window.setTimeout(function(scratch, dragEl, dragTarget) {
      scratch.classList.remove('anim-scratch');
      dragEl.remove();
      dragTarget.classList.remove('shake');
    }.bind(this), 200, scratch, dragEl, dragTarget);

    if (this.zedIsDead()) {
      window.setTimeout(function() {
        this.endBattle();
      }.bind(this), 800);
    } else if (Player.getProp('actions') === 0) {
      this.endTurn();
    }
  },

  zedIsDead: function() {
    const allAttackingZeds = document.querySelectorAll('#cards .zombie.fight:not(.dead)');
    return allAttackingZeds.length === 0;
  },

  endTurn: function() {
    const allBattleCards = battlePlayContainer.querySelectorAll('.battle-card');
    battleDeckProps.number = battleDeck.length;
    if (allBattleCards) {
      allBattleCards.forEach(battleCard => {
        battleCard.classList.add('inactive');
      });
    }
    document.querySelector('#battle-cards .end-turn').classList.add('is--hidden');
    this.showBattleMessage('Zombies Turn', 800);
    window.setTimeout(function() {
      this.zedAttack();
    }.bind(this), 400);
  },

  zedAttack: function() {
    const allAttackingZeds = document.querySelectorAll('#cards .zombie.fight:not(.dead)');
    const delay = 1200;

    for (const [index, zed] of allAttackingZeds.entries()) {
      zed.classList.add('attack');
      window.setTimeout(function() {
        var attack = parseInt(zed.querySelector('.attack').textContent);
        const dmg = Player.getProp('protection') - attack;
        if (dmg < 0) {
          Player.changeProps('health', dmg);  
          this.showBattleStats(dmg, 'red');
        } else {
          this.showBattleStats(-1 * attack, 'blue');
        }
        Player.changeProps('protection', -1 * attack);
        battleHealthMeter.classList.add('shake');
      }.bind(this), (delay / 3) + index * delay, zed);
      // single zed attacks
      window.setTimeout(function() {
        zed.classList.add('anim-punch');
        battleHealthMeter.classList.remove('shake');
        Audio.sfx('zed-attacks');
      }.bind(this), (delay / 4) + index * delay, zed);
    }
    // players turn after all zeds attacked
    window.setTimeout(function() {
      for (const [index, zed] of allAttackingZeds.entries()) {
        zed.classList.remove('attack');
        zed.classList.remove('anim-punch');
      }
      if (!Player.checkForDeath(false)) {
        this.nextTurn();
      }
    }.bind(this), (delay / 4) + allAttackingZeds.length * delay);
  },

  showBattleStats: function(stat, color) {
    const battleStats = document.querySelector('#battle-stats span.' + color);
    battleStats.textContent = stat;    
    battleStats.classList.add('active');
    window.setTimeout(function(battleStats) {
      battleStats.classList.remove('active');
    }.bind(this), 500, battleStats);
  },

  showBattleMessage: function(message, delay) {
    document.querySelector('#battle-message').innerHTML = message;
    document.querySelector('#battle-message').classList.add('active');
    window.setTimeout(function() {
      document.querySelector('#battle-message').classList.remove('active');
    }.bind(this), delay);
  },

  checkCraftPrereq: function() {
    const here = Player.getPlayerPosition();
    const buildingsHere = Map.getBuildingsAt(here.x, here.y);
    craftContainer.querySelectorAll('.button-craft').forEach((el) => {
      el.classList.remove('active');
      el.classList.remove('only1');
    });
    let totalCrafting = 0;
    // meat
    if (inventory.items['duck']?.amount > 0 && inventory.items['knife']?.amount > 0) {
      craftContainer.querySelector('.button-craft[data-item="meat"]').classList.add('active');
      totalCrafting++;
    }
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
    // roast
    if (buildingsHere && buildingsHere.includes('fireplace') && (inventory.items['meat']?.amount > 0 || inventory.items['pepper']?.amount > 0 || inventory.items['mushroom-2']?.amount > 0)) {
      craftContainer.querySelector('.button-craft[data-item="roast"]').classList.add('active');
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
        const itemSlot = inventoryContainer.querySelector('.slot.item-' + inventory.items[item].name);
        if (itemSlot) {
          itemSlot.classList.remove('unknown');
          if (inventory.items[item].amount > 0) {
            itemSlot.classList.remove('inactive');
            itemSlot.classList.add('active');
            itemSlot.querySelector('.amount').textContent = inventory.items[item].amount;
          } else {
            itemSlot.querySelector('.amount').textContent = '';
            itemSlot.classList.remove('active');
            itemSlot.classList.add('inactive');
          }  
        }
      }
    }
  }

}