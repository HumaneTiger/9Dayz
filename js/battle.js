import Audio from './audio.js'
import Binding from './binding.js'
import Props from './props.js'
import Player from './player.js'
import Cards from './cards.js'
import Actions from './actions.js'
import Items from './items.js'

const battleDrawContainer = document.querySelector('#battle-cards .draw');
const battlePlayContainer = document.querySelector('#battle-cards .play');
const battleHealthMeter = document.querySelector('#properties li.health');

const items = Props.getAllItems();
const inventory = Props.getInventory();

let cardZedDeck = [];
let battleDeck = [];
let battleDeckProps = {
  number: 0
};

export default {
  
  init() {
    this.bind();
    document.querySelector('#battle-cards .end-turn').addEventListener('click', this.endTurn.bind(this));
  },

  bind: function() {
    new Binding({
      object: battleDeckProps,
      property: 'number',
      element: document.getElementById('draw-amount')
    })
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

  startBattle(surprised, singleZedId) {

    Props.setGameProp('battle', true);
    if (singleZedId) {
      // result of successful luring
      cardZedDeck.push(singleZedId);
    } else {
      cardZedDeck = Cards.getAllZedsNearbyIds();
    }

    if (cardZedDeck.length > 0) {
      const spaceX = 400 - (cardZedDeck.length * 15);
      cardZedDeck.forEach(function(zedId, index) {
        let zedCardRef = Cards.getCardById(zedId);
        const zedObject = Props.getObject(zedId);
        zedObject.fighting = true;
        zedCardRef.classList.add('fight');
        zedCardRef.style.zIndex = null;
        zedCardRef.style.left = (2135/2) - (cardZedDeck.length * spaceX / 2) + (index * spaceX) + 'px';
      });

      document.getElementById('inventory').classList.remove('active');
      document.getElementById('craft').classList.remove('active');
      document.querySelector('#cards .cards-blocker').classList.remove('is--hidden');

      window.setTimeout(() => {
        document.querySelector('#cards .cards-blocker').classList.add('active');
      }, 100);

      window.setTimeout(() => {
        document.getElementById('properties').classList.remove('active');
        document.getElementById('actions').classList.remove('active');
        document.querySelector('#cards .cards-blocker').classList.add('active');
        this.spawnBattleDeck(surprised);
      }, 600);
    } else {
      this.endBattle();
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
      window.setTimeout(() => {
        this.zedAttack();
      }, 600);  
    } else {
      this.nextTurn();
    }
  },

  endBattle: function() {

    battleDeck = [];

    // Hide Battle UI
    document.getElementById('battle-cards').classList.add('is--hidden');
    battleDrawContainer.innerHTML = '';
    battlePlayContainer.innerHTML = '';
    document.getElementById('draw-amount').style.left = '0';
    battleDrawContainer.style.width = '';

    // Show UI
    battleHealthMeter.classList.remove('in-battle');
    document.getElementById('properties').classList.add('active');
    document.getElementById('actions').classList.add('active');
    document.querySelector('#cards .cards-blocker').classList.remove('active');

    window.setTimeout(function() {
      Player.changeProps('energy', -15);
      document.querySelector('#cards .cards-blocker').classList.add('is--hidden');
      
      cardZedDeck.forEach(function(zedId) {
        let zedCardRef = Cards.getCardById(zedId);
        const zedObject = Props.getObject(zedId);
        zedObject.fighting = false;
        zedCardRef.classList.remove('fight');
        for (let i = zedObject.actions.length - 1; i >= 0; i--) {
          if (zedObject.actions[i].id === 'lure' || zedObject.actions[i].id === 'attack') {
            zedCardRef.querySelector('li.' + zedObject.actions[i].id).remove();
            zedObject.actions.splice(i, 1);
          } else {
            // show search action
            zedCardRef.querySelector('li.' + zedObject.actions[i].id)?.classList.remove('is--hidden');
          }
        }
        Props.setGameProp('battle', false);
        Cards.hideActionFeedback(zedId);
        Player.updatePlayer();
        Actions.goBackFromAction(zedId);
        Player.lockMovement(false);
      });
      cardZedDeck = [];
    }.bind(this), 100);
  },

  nextTurn: function() {
    Player.changeProps('protection', -100);
    Player.changeProps('actions', -100);
    Player.changeProps('actions', 3);

    document.querySelector('#action-points-warning .very-low')?.classList.add('is--hidden');
    document.querySelector('#action-points-warning .low')?.classList.add('is--hidden');
    document.querySelector('#action-points')?.classList.remove('low-energy');

    // AP buffs when energy is low
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
    if (battleDeck.length < maxItems) maxItems = battleDeck.length;
    if (maxItems > 0) {
      document.querySelector('#battle-cards .end-turn').classList.remove('is--hidden');
      for (var i = 0; i < maxItems; i += 1) {
        const item = Items.getItemByName(battleDeck[i].name);
        battlePlayContainer.innerHTML += '<div class="battle-card inactive" data-item="' + item.name + '"><div class="inner">' +
                                        '<img class="item-pic" src="./img/items/' + item.name + '.PNG">' +
                                        '<div class="attack">' + item.damage + '</div><div class="shield">' + item.protection + '</div>' +
                                        '</div></div>';        
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
    const zedId = dragTarget.id;
    const zedObject = Props.getObject(zedId);
    const zedCardRef = Cards.getCardById(zedId);
    const item = Items.getItemByName(dragEl.dataset.item);
    const scratch = document.querySelector('.scratch');

    Player.changeProps('protection', item.protection);
    Player.changeProps('actions', -1);
    this.showBattleStats('+' + item.protection, 'blue');
    Audio.sfx('punch');

    zedObject.defense -= item.damage;
    if (zedObject.defense <= 0) {
      zedCardRef.classList.add('dead');
      zedObject.dead = true;
      zedObject.fighting = false;
    } else {
      zedCardRef.querySelector('.health').textContent = zedObject.defense;
    }

    if (item.durability && item.durability > 0) {
      item.durability -= 1;
    }
    if (!item.durability) {
      //remove item from inventory
      Props.addToInventory(item.name, -1);
      //remove item from battle deck
      for (var i = 0; i < battleDeck.length; i += 1) {
        if (battleDeck[i].name === item.name) {
          battleDeck.splice(i, 1);
          break;
        }
      }
    }
    // check if any items are left
    if (battleDeck.length === 0) {
      this.showBattleMessage('No items left.<br>End turn to seal your fate...', 2000);
    }
    Items.fillInventorySlots();

    // play "hit" animation, resolve item card
    scratch.style.left = zedCardRef.style.left;
    scratch.classList.add('anim-scratch');
    zedCardRef.classList.add('shake');
    dragEl.classList.add('resolve');

    // cleanup
    window.setTimeout(function(scratch, dragEl, zedCardRef) {
      scratch.classList.remove('anim-scratch');
      dragEl.remove();
      zedCardRef.classList.remove('shake');
    }.bind(this), 200, scratch, dragEl, zedCardRef);

    if (this.zedIsDead()) {
      window.setTimeout(function() {
        this.endBattle();
      }.bind(this), 800);
    } else if (Player.getProp('actions') === 0) {
      this.endTurn();
    }
  },

  zedIsDead: function() {
    const zedIsDead = (id) => Props.getObject(id).dead;
    return cardZedDeck.every(function(id) {
      return zedIsDead(id);
    });
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
    window.setTimeout(() => {
      this.zedAttack();
    }, 400);
  },

  zedAttack: function() {

    const delay = 1200;
    const allAttackingZeds = cardZedDeck.filter(zed => Props.getObject(zed).fighting);

    for (let index = 0; index < allAttackingZeds.length; index += 1) {
      const zedId = allAttackingZeds[index];
      let zedCardRef = Cards.getCardById(zedId);
      const zedObject = Props.getObject(zedId);

      zedCardRef.classList.add('attack');

      window.setTimeout(() => {
        let ratAteFood = false;
        if (zedObject.name === 'rat') {
          let foodItem = Items.getFirstItemOfType('eat');
          if (foodItem !== undefined) {
            ratAteFood = true;
            zedObject.defense += foodItem.protection;
            zedCardRef.querySelector('.health').textContent = zedObject.defense;
            //remove item from inventory
            Props.addToInventory(foodItem.name, -1);
            //remove item from battle deck
            for (var i = 0; i < battleDeck.length; i += 1) {
              if (battleDeck[i].name === foodItem.name) {
                battleDeck.splice(i, 1);
                break;
              }
            }
            battleDeckProps.number = battleDeck.length;
            this.showBattleStats(foodItem.name, 'image');
          }
        }
        if (!ratAteFood) {
          const attack = zedObject.attack;
          const dmg = Player.getProp('protection') - attack;
          if (dmg < 0) {
            Player.changeProps('health', dmg);  
            this.showBattleStats(dmg, 'red');
          } else {
            this.showBattleStats(-1 * attack, 'blue');
          }
          Player.changeProps('protection', -1 * attack);
          battleHealthMeter.classList.add('shake');  
        }
      }, (delay / 3) + index * delay);

      // single zed attacks
      window.setTimeout(() => {
        zedCardRef.classList.add('anim-punch');
        battleHealthMeter.classList.remove('shake');
        if (zedObject.name === 'rat') {
          Audio.sfx('rat-attacks');
        } else {
          Audio.sfx('zed-attacks');
        }
      }, (delay / 4) + index * delay);
    };

    // players turn after all zeds attacked
    window.setTimeout(() => {
      allAttackingZeds.forEach(function(zedId) {
        let zedCardRef = Cards.getCardById(zedId);
        zedCardRef.classList.remove('attack');
        zedCardRef.classList.remove('anim-punch');
      });
      if (!Player.checkForDeath(false)) {
        this.nextTurn();
      }
    }, (delay / 4) + allAttackingZeds.length * delay);

  },

  showBattleStats: function(stat, type) {
    const battleStats = document.querySelector('#battle-stats span.' + type);
    if (type === 'image') {
      battleStats.innerHTML = '<img width="60" height="auto" src="./img/items/' + stat + '.PNG">';
    } else {
      battleStats.innerHTML = stat;    
    }
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
  }
}