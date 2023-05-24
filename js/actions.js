import Audio from './audio.js'
import Props from './props.js'
import Player from './player.js'
import Cards from './cards.js'
import Map from './map.js'
import Items from './items.js'

export default {
  
  init() {

    document.body.addEventListener('mouseover', this.checkForCardHover.bind(this));
    document.body.addEventListener('mouseout', this.checkForCardUnHover.bind(this));
    document.body.addEventListener('mousedown', this.checkForCardClick.bind(this));
  },

  checkForCardClick: function(ev) {

    const target = ev.target;
    const cardId = target.closest('div.card')?.id;
    const clickButton = target.closest('div.action-button');
    const grabItem = target.closest('li.item:not(.is--hidden)');

    if (cardId) {

      const object = Props.getObject(cardId);

      ev.preventDefault();
      ev.stopPropagation();

      if (clickButton && !object.disabled) {

        const action = clickButton.dataset.action;
        const time = parseInt(clickButton.dataset.time);
        const energy = parseInt(clickButton.dataset.energy) || 0;
        const x = object.x,
              y = object.y;

        if (action && !object.actions.find(singleAction => singleAction.name === action)?.locked) {
          Audio.sfx('click');
          if (action === 'search') {
            this.showActionFeedback(cardId, "Searching...", 'li.search');
            //implement in cards.js ?
            //clickCard.querySelector('ul.items')?.classList.remove('is--hidden');
            this.goToAndAction(x, y, this.simulateGathering, cardId, time, energy, 0);
          } else if (action === 'gather') {
            this.showActionFeedback(cardId, "Gathering...", 'li.gather');
            //implement in cards.js ?
            //clickCard.querySelector('ul.items')?.classList.remove('is--hidden');
            this.goToAndAction(x, y, this.simulateGathering, cardId, time, energy, 0);
          } else if (action === 'scout-area') {
            this.showActionFeedback(cardId, 'Scouting...', 'li.scout-area');
            this.goToAndAction(x, y, this.simulateScouting, cardId, time, energy);
          } else if (action === 'rest') {
            this.showActionFeedback(cardId, 'Resting...', false);
            this.goToAndAction(x, y, this.simulateResting, cardId, time, energy);
          } else if (action === 'sleep') {
            this.showActionFeedback(cardId, 'Sleeping...', false);
            this.goToAndAction(x, y, this.simulateSleeping, cardId, time, energy);
          } else if (action === 'cook') {
            this.simulateCooking();
          } else if (action === 'cut-down') {
            this.showActionFeedback(cardId, 'Cutting down...', false);
            this.goToAndAction(x, y, this.simulateCuttingDown, cardId, time, energy);
          } else if (action === 'smash-window') {
            this.showActionFeedback(cardId, 'Smashing Window', 'li.smash-window');
            this.goToAndAction(x, y, this.simulateSmashing, cardId, time, energy);
          } else if (action === 'break-door') {
            this.showActionFeedback(cardId, 'Breaking Door...', 'li.break-door');
            this.goToAndAction(x, y, this.simulateBreaking, cardId, time, energy);
          } else if (action === 'attack') {
            this.showActionFeedback(cardId, 'Attacking...', 'li.attackz');
            this.goToAndAction(x, y, this.simulateAttacking, cardId, time, energy);
          } else if (action === 'lure') {
            this.showActionFeedback(cardId, 'Luring...', 'li.lure');
            this.simulateLuring(cardId, time, energy);
          } else if (action === 'got-it') {
            this.gotIt(cardId);
          } else if (action === 'read') {
            this.showActionFeedback(cardId, 'Reading...', 'li.read');
            this.goToAndAction(x, y, this.reading, cardId, time, energy);
          } else if (action === 'drink') {
            this.showActionFeedback(cardId, 'Drinking...', false);
            this.goToAndAction(x, y, this.drinking, cardId, time, energy);
          } else {
            console.log('Unknown action: ' + action);
          }
        } else {
          Audio.sfx('nope');
        }
      }
      if (grabItem) {
        if (grabItem.dataset.item && grabItem.dataset.amount) {
          Props.addToInventory(grabItem.dataset.item, grabItem.dataset.amount);
          grabItem.dataset.item = '';
          grabItem.classList.add('transfer');
          Items.inventoryChangeFeedback();
          Items.fillInventorySlots();
          Audio.sfx('pick',0,0.1);
          window.setTimeout(function(grabItem, clickCard) {
            grabItem.remove();
            if (clickCard.querySelector('ul.items li.preview') === null && clickCard.querySelector('ul.items li.item') === null) {
              clickCard.querySelector('ul.items').remove();
              clickCard.querySelector('div.banner')?.classList.remove('is--hidden');
              clickCard.classList.add('looted');
              // check if card can be removed (no actions left)
              Cards.updateCardDeck();
            }
          }, 400, grabItem, clickCard);
        }
      }
    }
  },

  checkForCardHover: function(ev) {

    const target = ev.target;
    const hoverCard = target.closest('div.card');
    const hoverButton = target.closest('a.action-button');

    if (hoverCard && !hoverCard.classList.contains('fight')) {
      hoverCard.dataset.oldZindex = hoverCard.style.zIndex;
      hoverCard.style.zIndex = 200;
      if (hoverButton) {
        hoverCard.classList.add('hover-button');
      } else {
        hoverCard.classList.remove('hover-button');
      }  

      let buildingIcon = document.querySelector('#maximap .building-icon.at-' + hoverCard.dataset.x + '-' + hoverCard.dataset.y);
      let zedIcon = document.querySelector('#maximap .zed-icon.at-' + hoverCard.dataset.x + '-' + hoverCard.dataset.y);
      
      if (buildingIcon && !hoverCard.classList.contains('zombie')) {
        buildingIcon.classList.add('highlight');
      } else if (zedIcon) {
        zedIcon.classList.add('highlight');
      }
    }
  },

  checkForCardUnHover: function(ev) {

    const target = ev.target;
    const hoverCard = target.closest('div.card');

    if (hoverCard && !hoverCard.classList.contains('fight')) {
      hoverCard.style.zIndex = hoverCard.dataset.oldZindex;
      let buildingIcon = document.querySelector('#maximap .building-icon.at-' + hoverCard.dataset.x + '-' + hoverCard.dataset.y);
      let zedIcon = document.querySelector('#maximap .zed-icon.at-' + hoverCard.dataset.x + '-' + hoverCard.dataset.y);      
      if (buildingIcon && !hoverCard.classList.contains('zombie')) {
        buildingIcon.classList.remove('highlight');
      } else if (zedIcon) {
        zedIcon.classList.remove('highlight');
      }
    }
  },

  showActionFeedback: function(cardId, text, removeSelector) {

    const cardRef = Cards.getCardById(cardId);

    /* remove selected action */
    if (removeSelector) {
      cardRef.querySelector(removeSelector).remove();
    }
    /* hide actions and show feedback */
    cardRef.querySelector('div.banner')?.classList.add('is--hidden');
    cardRef.querySelector('ul.actions')?.classList.add('is--hidden');
    cardRef.querySelector('p.activity').textContent = text;
    cardRef.querySelector('p.activity')?.classList.remove('is--hidden');
  },  
  
  goToAndAction: function(x, y, actionfunction, cardId, time, energy, delay) {
    Player.lockMovement(true);
    Cards.disableActions();
    Player.movePlayerTo(x, y);
    window.setTimeout(function() {
      actionfunction.call(this, cardId, time, energy);
    }.bind(this), delay !== undefined ? delay : 1000);
  },

  goBackFromAction: function(cardId) {
    this.endAction(cardId);
    Player.updatePlayer(true);
    window.setTimeout(function() {
      Player.lockMovement(false);
    }.bind(this), 1000);
  },

  endAction: function(cardId) {
    const cardRef = Cards.getCardById(cardId);
    if (cardRef) {
      if (cardRef.querySelector('p.activity')) {
        cardRef.querySelector('p.activity').textContent = '';
        cardRef.querySelector('p.activity').classList.add('is--hidden');  
      }
      cardRef.querySelector('ul.actions')?.classList.remove('is--hidden');
      if (cardRef.querySelector('ul.items')?.classList.contains('is--hidden')) {
        cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
      }  
    } else {
      console.log('no cardRef for cardId: ', cardId);
    }
  },

  fastForward: function(callbackfunction, cardId, time, newSpeedOpt, energy) {
    const defaultSpeed = Props.getGameSpeedDefault();
    const newSpeed = newSpeedOpt || 400;
    if (time) {
      let ticks = parseInt(time) / 10;
      Props.setGameSpeedDefault(newSpeed);
      window.setTimeout(function(defaultSpeed, cardId) {
        Props.setGameSpeedDefault(defaultSpeed);
        callbackfunction.call(this, cardId, energy);
      }.bind(this), ticks * newSpeed, defaultSpeed, cardId);  
    }
  },

  simulateGathering: function(cardId, time, energy) {

    const cardRef = Cards.getCardById(cardId);
    let allPreviews = cardRef.querySelectorAll('ul.items li.preview');
    let allItems = cardRef.querySelectorAll('ul.items li.item');

    let timeout = 2000;

    cardRef.querySelector('ul.items').classList.remove('is--hidden');
    
    allPreviews[0].querySelector('.unknown').classList.add('is--hidden');
    allPreviews[0].querySelector('.searching').classList.remove('is--hidden');

    for (var i = 1; i <= allPreviews.length; i += 1) {
      window.setTimeout(function(index, allPreviews, allItems, cardId, energy) {
        allPreviews[index - 1].remove();
        if (allPreviews[index]) {
          allPreviews[index].querySelector('.unknown').classList.add('is--hidden');
          allPreviews[index].querySelector('.searching').classList.remove('is--hidden');        
        }
        if (allItems[index-1]) {
          allItems[index-1].classList.remove('is--hidden');     
        }
        if (index === allPreviews.length) {
          this.goBackFromAction(cardId); // go back before any new DOM nodes will be added to Card deck
          const cardRef = Cards.getCardById(cardId);
          Player.changeProps('energy', energy);
          if (cardRef.querySelector('ul.items li.item') === null) {
            cardRef.querySelector('ul.items').remove();
            cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
            cardRef.classList.add('looted');
            // check if card can be removed (no actions left)
            Cards.updateCardDeck();
          }
        }
      }.bind(this), i * timeout, i, allPreviews, allItems, cardId, energy);
    }
  },

  simulateScouting: function(cardId, time, energy) {

    const cardRef = Cards.getCardById(cardId);

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardId, energy) {
      const cardRef = Cards.getCardById(cardId);
      const x = parseInt(cardRef.dataset.x);
      const y = parseInt(cardRef.dataset.y);
      if (x % 4 === 0 || y % 4 === 0) {
        Map.mapUncoverAt(x, y);
      }
      this.goBackFromAction(cardId);
      Player.findBuildings(x, y);
      Player.findZeds(x, y);
      document.getElementById('scoutmarker').classList.add('is--hidden');
      Player.changeProps('energy', energy); 
    }, cardId, time, 800, energy);
  },

  simulateResting: function(cardId, time, energy) {

    const cardRef = Cards.getCardById(cardId);

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardId, energy) {
      Player.changeProps('energy', energy);
      Player.changeProps('health', Math.floor(energy / 2));
      Player.changeProps('food', -10);
      Player.changeProps('thirst', -14);
      document.getElementById('scoutmarker').classList.add('is--hidden');
      this.goBackFromAction(cardId);
    }, cardId, time, 800, energy);
  },

  simulateSleeping: function(cardId, time, energy) {

    const cardRef = Cards.getCardById(cardId);

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardId, energy) {
      Player.changeProps('energy', energy);
      Player.changeProps('health', Math.floor(energy / 2));
      Player.changeProps('food', -45);
      Player.changeProps('thirst', -55);
      document.getElementById('scoutmarker').classList.add('is--hidden');
      this.goBackFromAction(cardId);
    }, cardId, time, 100, energy);

  },

  simulateCooking: function() {
    document.getElementById('craft').classList.toggle('active');
    document.getElementById('inventory').classList.remove('active');
  },

  simulateCuttingDown: function(cardId, time, energy) {

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    this.fastForward(function(cardId, energy) {
      this.goBackFromAction(cardId);
      if (Props.getGameMode() === 'real') {
        Props.addToInventory('improvised-axe', 0, -1);
      }
      Props.addToInventory('stump', 1); 
      Props.addToInventory('branch', 2);
      Items.inventoryChangeFeedback();
      Items.fillInventorySlots();
      Player.changeProps('energy', energy);
      Cards.removeCardFromDeckById(cardId);
    }, cardId, time, 800, energy);
  },

  simulateLuring: function(cardId, time, energy) {

    Player.lockMovement(true);
    Cards.disableActions();

    const cardRef = Cards.getCardById(cardId);
    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardId, energy) {

      this.endAction(cardId);

      document.getElementById('scoutmarker').classList.add('is--hidden');

      // 60:40 chance it works
      if (Math.random() >= 0.4) {
        Player.lockMovement(true);
        // das geht jetzt sicher einfacher
        const cardRef = Cards.getCardById(cardId);
        if (cardRef.querySelector('p.activity')) {
          cardRef.querySelector('p.activity').textContent = '';
          cardRef.querySelector('p.activity').classList.add('is--hidden');  
        }
        Items.startBattle(false, cardRef);
      } else {
        // das auch :-)
        Cards.enableActions();
        Player.lockMovement(false);
        Player.changeProps('energy', energy);
        Audio.sfx('nope');
        Cards.updateCardDeck();
      }
    }, cardId, time, 1600, energy);
  },

  simulateAttacking: function(cardId) {

    const x = parseInt(document.getElementById(cardId)?.dataset.x);
    const y = parseInt(document.getElementById(cardId)?.dataset.y);
    Player.findZeds(x, y);
    Cards.updateCardDeck();

    window.setTimeout(function() {
      this.endAction(cardId);
      Items.startBattle();
    }.bind(this), 800);

  },

  gotIt: function(cardId) {
    const cardRef = Cards.getCardById(cardId);
    if (cardRef.dataset.x === "30" && cardRef.dataset.y === "7") {
      Player.checkForWin();
    }
    Cards.removeCardFromDeckById(cardId);
  },

  simulateBreaking: function(cardId, time, energy) {

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    this.fastForward(function(cardId, energy) {
      if (Props.getGameMode() === 'real') {
        Props.addToInventory('improvised-axe', 0, -1);
        Items.fillInventorySlots();
      }
      Cards.getCardById(cardId).classList.remove('locked');
      Player.changeProps('energy', energy);
      this.goBackFromAction(cardId);
    }, cardId, time, 800, energy);
  },

  simulateSmashing: function(cardId, time, energy) {

    Audio.sfx('chop-wood');

    this.fastForward(function(cardId, energy) {
      Player.changeProps('energy', energy);
      Cards.getCardById(cardId).classList.remove('locked');
      this.goBackFromAction(cardId);
    }, cardId, time, 800, energy);
  },

  drinking: function(cardId, time) {

    Audio.sfx('water');

    this.fastForward(function(cardId) {
      Player.changeProps('thirst', 25);
      this.goBackFromAction(cardId);
    }, cardId, time, 800);
  },

  reading: function(cardId) {
    window.setTimeout(function(cardId) {
      const targetLocationName = Cards.getCardById(cardId).dataset.name;
      if (targetLocationName === 'signpost-1') {
        Map.showTargetLocation('Lakeside Camp Resort');
        Map.showTargetLocation('Rocksprings');
      } else if (targetLocationName === 'signpost-2') {
        Map.showTargetLocation('Litchfield');
      } else if (targetLocationName === 'signpost-3') {
        Map.showTargetLocation('Greenleafton');
      } else if (targetLocationName === 'signpost-4') {
        Map.showTargetLocation('Haling Cove');
      } else if (targetLocationName === 'signpost-5') {
        Map.showTargetLocation('Billibalds Farm');
      } else if (targetLocationName === 'signpost-6') {
        Map.showTargetLocation('Camp Silverlake');
      } else if (targetLocationName === 'signpost-7') {
        Map.showTargetLocation('Harbor Gas Station');
      }
      this.goBackFromAction(cardId);
    }.bind(this), 1800, cardId);
  }
}
