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
            Cards.showActionFeedback(cardId, "Searching...", action);
            //implement in cards.js ?
            //clickCard.querySelector('ul.items')?.classList.remove('is--hidden');
            this.goToAndAction(x, y, this.simulateGathering, cardId, time, energy, 0);
          } else if (action === 'gather') {
            Cards.showActionFeedback(cardId, "Gathering...", action);
            //implement in cards.js ?
            //clickCard.querySelector('ul.items')?.classList.remove('is--hidden');
            this.goToAndAction(x, y, this.simulateGathering, cardId, time, energy, 0);
          } else if (action === 'scout-area') {
            Cards.showActionFeedback(cardId, 'Scouting...', action);
            this.goToAndAction(x, y, this.simulateScouting, cardId, time, energy);
          } else if (action === 'rest') {
            Cards.showActionFeedback(cardId, 'Resting...', false);
            this.goToAndAction(x, y, this.simulateResting, cardId, time, energy);
          } else if (action === 'sleep') {
            Cards.showActionFeedback(cardId, 'Sleeping...', false);
            this.goToAndAction(x, y, this.simulateSleeping, cardId, time, energy);
          } else if (action === 'cook') {
            this.simulateCooking();
          } else if (action === 'cut-down') {
            Cards.showActionFeedback(cardId, 'Cutting down...', false);
            this.goToAndAction(x, y, this.simulateCuttingDown, cardId, time, energy);
          } else if (action === 'smash-window') {
            Cards.showActionFeedback(cardId, 'Smashing Window', action);
            this.goToAndAction(x, y, this.simulateSmashing, cardId, time, energy);
          } else if (action === 'break-door') {
            Cards.showActionFeedback(cardId, 'Breaking Door...', action);
            this.goToAndAction(x, y, this.simulateBreaking, cardId, time, energy);
          } else if (action === 'attack') {
            Cards.showActionFeedback(cardId, 'Attacking...', 'attackz');
            this.goToAndAction(x, y, this.simulateAttacking, cardId, time, energy);
          } else if (action === 'lure') {
            Cards.showActionFeedback(cardId, 'Luring...', action);
            this.simulateLuring(cardId, time, energy);
          } else if (action === 'got-it') {
            this.gotIt(cardId);
          } else if (action === 'read') {
            Cards.showActionFeedback(cardId, 'Reading...', action);
            this.goToAndAction(x, y, this.reading, cardId, time, energy);
          } else if (action === 'drink') {
            Cards.showActionFeedback(cardId, 'Drinking...', false);
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
              Cards.renderCardDeck();
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
    Cards.hideActionFeedback(cardId);
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
            Cards.renderCardDeck();
          }
        }
      }.bind(this), i * timeout, i, allPreviews, allItems, cardId, energy);
    }
  },

  simulateScouting: function(cardId, time, energy) {

    Map.showScoutMarkerFor(cardId);

    this.fastForward(function(cardId, energy) {
      const object = Props.getObject(cardId);
      /* if (object.x % 4 === 0 || object.y % 4 === 0) { Map.mapUncoverAt(x, y); } */
      this.goBackFromAction(cardId);
      const allFoundObjectIds = Player.findObjects(object.x, object.y);
      Player.handleFoundObjectIds(allFoundObjectIds);
      Map.hideScoutMarker();
      Player.changeProps('energy', energy); 
    }, cardId, time, 800, energy);
  },

  simulateResting: function(cardId, time, energy) {

    Map.showScoutMarkerFor(cardId);

    this.fastForward(function(cardId, energy) {
      Player.changeProps('energy', energy);
      Player.changeProps('health', Math.floor(energy / 2));
      Player.changeProps('food', -10);
      Player.changeProps('thirst', -14);
      Map.hideScoutMarker();
      this.goBackFromAction(cardId);
    }, cardId, time, 800, energy);
  },

  simulateSleeping: function(cardId, time, energy) {

    Map.showScoutMarkerFor(cardId);

    this.fastForward(function(cardId, energy) {
      Player.changeProps('energy', energy);
      Player.changeProps('health', Math.floor(energy / 2));
      Player.changeProps('food', -45);
      Player.changeProps('thirst', -55);
      Map.hideScoutMarker();
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
      Cards.removeCard(cardId);
    }, cardId, time, 800, energy);
  },

  simulateLuring: function(cardId, time, energy) {

    Player.lockMovement(true);
    Cards.disableActions();

    Map.showScoutMarkerFor(cardId);

    this.fastForward(function(cardId, energy) {

      this.endAction(cardId);

      Map.hideScoutMarker();

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
        Cards.renderCardDeck();
      }
    }, cardId, time, 1600, energy);
  },

  simulateAttacking: function(cardId) {

    const x = parseInt(document.getElementById(cardId)?.dataset.x);
    const y = parseInt(document.getElementById(cardId)?.dataset.y);
    Player.findZeds(x, y);
    Cards.renderCardDeck();

    window.setTimeout(function() {
      this.endAction(cardId);
      Items.startBattle();
    }.bind(this), 800);

  },

  gotIt: function(cardId) {
    /*
    const cardRef = Cards.getCardById(cardId);
    if (cardRef.dataset.x === "30" && cardRef.dataset.y === "7") {
      Player.checkForWin();
    }*/
    Cards.removeCard(cardId);
    Cards.renderCardDeck();
  },

  simulateBreaking: function(cardId, time, energy) {

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    this.fastForward(function(cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      if (Props.getGameMode() === 'real') {
        Props.addToInventory('improvised-axe', 0, -1);
        Items.fillInventorySlots();
      }
      Player.changeProps('energy', energy);
      this.goBackFromAction(cardId);
    }, cardId, time, 800, energy);
  },

  simulateSmashing: function(cardId, time, energy) {

    Audio.sfx('chop-wood');

    this.fastForward(function(cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      Player.changeProps('energy', energy);
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
      const targetLocationName = Props.getObject(cardId).name;
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
