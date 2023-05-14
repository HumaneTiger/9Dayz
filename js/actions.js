import Audio from './audio.js'
import Props from './props.js'
import Player from './player.js'
import Cards from './cards.js'
import Map from './map.js'
import Items from './items.js'

var actionsLocked = false;

export default {
  
  init() {

    document.body.addEventListener('mouseover', this.checkForCardHover.bind(this));
    document.body.addEventListener('mouseout', this.checkForCardUnHover.bind(this));
    document.body.addEventListener('mousedown', this.checkForCardClick.bind(this));
  },

  lockActions: function(locked) {
    actionsLocked = locked;
  },

  isActionsLocked: function() {
    return actionsLocked;
  },

  checkForCardClick: function(ev) {

    const target = ev.target;
    const clickCard = target.closest('div.card');
    const clickButton = target.closest('a.action-button');
    const grabItem = target.closest('li.item:not(.is--hidden)');

    if (clickCard) {
      ev.preventDefault();
      ev.stopPropagation();
      if (clickButton && (!actionsLocked || clickCard.classList.contains('event'))) {
        const action = clickButton.href.split('#')[1];
        const time = parseInt(clickButton.dataset.time);
        const energy = parseInt(clickButton.dataset.energy) || 0;
        const x = clickCard.dataset.x,
              y = clickCard.dataset.y;
        if (action && !clickButton.closest('li').classList.contains('locked')) {
          Audio.sfx('click');
          if (action === 'search') {
            this.showActionFeedback(clickCard, "Searching...", 'li.search');
            this.goToAndAction(x, y, this.simulateGathering, clickCard, time, energy);
          } else if (action === 'gather') {
            this.showActionFeedback(clickCard, "Gathering...", 'li.gather');
            this.goToAndAction(x, y, this.simulateGathering, clickCard, time, energy);
          } else if (action === 'scout-area') {
            this.showActionFeedback(clickCard, 'Scouting...', 'li.scout-area');
            this.goToAndAction(x, y, this.simulateScouting, clickCard, time, energy);
          } else if (action === 'rest') {
            this.showActionFeedback(clickCard, 'Resting...', false);
            this.goToAndAction(x, y, this.simulateResting, clickCard, time, energy);
          } else if (action === 'sleep') {
            this.showActionFeedback(clickCard, 'Sleeping...', false);
            this.goToAndAction(x, y, this.simulateSleeping, clickCard, time, energy);
          } else if (action === 'cook') {
            this.simulateCooking(clickCard);
          } else if (action === 'cut-down') {
            this.showActionFeedback(clickCard, 'Cutting down...', false);
            this.goToAndAction(x, y, this.simulateCuttingDown, clickCard, time, energy);
          } else if (action === 'smash-window') {
            this.showActionFeedback(clickCard, 'Smashing Window', 'li.smash-window');
            this.goToAndAction(x, y, this.simulateSmashing, clickCard, time, energy);
          } else if (action === 'break-door') {
            this.showActionFeedback(clickCard, 'Breaking Door...', 'li.break-door');
            this.goToAndAction(x, y, this.simulateBreaking, clickCard, time, energy);
          } else if (action === 'attack') {
            this.simulateAttacking(clickCard);
          } else if (action === 'lure') {
            this.simulateLuring(clickCard, time, energy);
          } else if (action === 'got-it') {
            this.gotIt(clickCard);
          } else if (action === 'read') {
            this.reading(clickCard);
            this.showActionFeedback(clickCard, 'Reading...', 'li.read');
            this.goToAndAction(x, y, this.reading, clickCard, time, energy);
          } else if (action === 'drink') {
            this.showActionFeedback(clickCard, 'Drinking...', false);
            this.goToAndAction(x, y, this.drinking, clickCard, time, energy);
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
            if (clickCard.querySelector('ul.items li.item') === null) {
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

  showActionFeedback: function(cardRef, text, removeSelector) {
    /* remove selected action */
    if (removeSelector) {
      cardRef.querySelector(removeSelector).remove();
    }
    /* hide actions and show feedback */
    cardRef.querySelector('div.banner').classList.add('is--hidden');
    cardRef.querySelector('ul.actions').classList.add('is--hidden');
    cardRef.querySelector('p.activity').textContent = text;
    cardRef.querySelector('p.activity').classList.remove('is--hidden');
  },  
  
  goToAndAction: function(x, y, actionfunction, cardRef, time, energy) {
    Player.lockMovement(true);
    this.lockActions(true);
    Cards.disableActions(true);
    Player.movePlayerTo(x, y);
    window.setTimeout(function() {
      actionfunction.call(this, cardRef, time, energy);
    }.bind(this), 1000);
  },

  goBackFromAction: function(cardRef) {
    this.endAction(cardRef);
    Player.updatePlayer();
    this.lockActions(false);
    window.setTimeout(function() {
      Player.lockMovement(false);
    }.bind(this), 1000);
  },

  endAction: function(cardRef) {
    if (cardRef.querySelector('p.activity')) {
      cardRef.querySelector('p.activity').textContent = '';
      cardRef.querySelector('p.activity').classList.add('is--hidden');  
    }
    cardRef.querySelector('ul.actions')?.classList.remove('is--hidden');
    if (cardRef.querySelector('ul.items')?.classList.contains('is--hidden')) {
      cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
    }
  },

  fastForward: function(callbackfunction, cardRef, time, newSpeedOpt, energy) {
    const defaultSpeed = Props.getGameSpeedDefault();
    const newSpeed = newSpeedOpt || 400;
    if (time) {
      let ticks = parseInt(time) / 10;
      Props.setGameSpeedDefault(newSpeed);
      window.setTimeout(function(defaultSpeed, cardRef) {
        Props.setGameSpeedDefault(defaultSpeed);
        callbackfunction.call(this, cardRef, energy);
      }.bind(this), ticks * newSpeed, defaultSpeed, cardRef);  
    }
  },

  simulateGathering: function(cardRef, time, energy) {

    let allPreviews = cardRef.querySelectorAll('ul.items li.preview');
    let allItems = cardRef.querySelectorAll('ul.items li.item');

    let timeout = 2000;

    cardRef.querySelector('ul.items').classList.remove('is--hidden');
    
    allPreviews[0].querySelector('.unknown').classList.add('is--hidden');
    allPreviews[0].querySelector('.searching').classList.remove('is--hidden');

    for (var i = 1; i <= allPreviews.length; i += 1) {
      window.setTimeout(function(index, allPreviews, allItems, cardRef, energy) {
        allPreviews[index - 1].classList.add('is--hidden');
        if (allPreviews[index]) {
          allPreviews[index].querySelector('.unknown').classList.add('is--hidden');
          allPreviews[index].querySelector('.searching').classList.remove('is--hidden');        
        }
        if (allItems[index-1]) {
          allItems[index-1].classList.remove('is--hidden');     
        }
        if (index === allPreviews.length) {
          this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
          Player.changeProps('energy', energy); 
        }
      }.bind(this), i * timeout, i, allPreviews, allItems, cardRef, energy);
    }
  },

  simulateScouting: function(cardRef, time, energy) {

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardRef, energy) {
      this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
      const x = parseInt(cardRef.dataset.x);
      const y = parseInt(cardRef.dataset.y);
      if (x % 4 === 0 || y % 4 === 0) {
        Map.mapUncoverAt(x, y);
      }
      Player.findBuildings(x, y);
      Player.findZeds(x, y);
      document.getElementById('scoutmarker').classList.add('is--hidden');
      Player.changeProps('energy', energy); 
    }, cardRef, time, 800, energy);
  },

  simulateResting: function(cardRef, time, energy) {

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardRef, energy) {
      this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
      Player.changeProps('energy', energy);
      Player.changeProps('health', Math.floor(energy / 2));
      Player.changeProps('food', -10);
      Player.changeProps('thirst', -14);
      document.getElementById('scoutmarker').classList.add('is--hidden');
    }, cardRef, time, 800, energy);
  },

  simulateSleeping: function(cardRef, time, energy) {

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardRef, energy) {
      this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
      Player.changeProps('energy', energy);
      Player.changeProps('health', Math.floor(energy / 2));
      Player.changeProps('food', -45);
      Player.changeProps('thirst', -55);
      document.getElementById('scoutmarker').classList.add('is--hidden');
    }, cardRef, time, 100, energy);

  },

  simulateCooking: function() {
    document.getElementById('craft').classList.toggle('active');
    document.getElementById('inventory').classList.remove('active');
  },

  simulateCuttingDown: function(cardRef, time, energy) {

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    this.fastForward(function(cardRef, energy) {
      this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
      if (Props.getGameMode() === 'real') {
        Props.addToInventory('improvised-axe', 0, -1);
      }
      Props.addToInventory('stump', 1); 
      Props.addToInventory('branch', 2);
      Items.inventoryChangeFeedback();
      Items.fillInventorySlots();
      Cards.removeCardFromDeck(cardRef);
      Player.changeProps('energy', energy);
    }, cardRef, time, 800, energy);
  },

  simulateLuring: function(cardRef, time, energy) {

    Player.lockMovement(true);
    /* remove selected action */
    cardRef.querySelector('li.lure')?.remove();

    cardRef.querySelector('ul.actions').classList.add('is--hidden');

    /* show activity */
    cardRef.querySelector('p.activity').textContent = 'Luring...';
    cardRef.querySelector('p.activity').classList.remove('is--hidden');

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardRef, energy) {
      this.endAction(cardRef); // has to be right at the beginning
      document.getElementById('scoutmarker').classList.add('is--hidden');
      // 60:40 chance it works
      if (Math.random() >= 0.4) {
        Items.startBattle(false, cardRef);
      } else {
        Player.changeProps('energy', energy);
        Player.lockMovement(false);
        Audio.sfx('nope');
        Cards.updateCardDeck();
      }
    }, cardRef, time, 1600, energy);
  },

  gotIt: function(cardRef) {
    Cards.removeCardFromDeck(cardRef);
    if (cardRef.dataset.x === "30" && cardRef.dataset.y === "7") {
      Player.checkForWin();
    }
  },

  simulateAttacking: function(cardRef) {

    Player.lockMovement(true);
    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);

    Player.findZeds(x, y);
    Cards.updateCardDeck();

    window.setTimeout(function() {
      Items.startBattle();
    }.bind(this), 800);

  },

  simulateBreaking: function(cardRef, time, energy) {

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    this.fastForward(function(cardRef, energy) {
      this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
      if (Props.getGameMode() === 'real') {
        Props.addToInventory('improvised-axe', 0, -1);
        Items.fillInventorySlots();
      }
      cardRef.classList.remove('locked');
      Player.changeProps('energy', energy);
    }, cardRef, time, 800, energy);
  },

  simulateSmashing: function(cardRef, time, energy) {

    Audio.sfx('chop-wood');

    this.fastForward(function(cardRef, energy) {
      this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
      Player.changeProps('energy', energy);
      cardRef.classList.remove('locked');
    }, cardRef, time, 800, energy);
  },

  drinking: function(cardRef, time) {

    Audio.sfx('water');

    this.fastForward(function(cardRef) {
      this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
      Player.changeProps('thirst', 25);
    }, cardRef, time, 800);
  },

  reading: function(cardRef) {
    window.setTimeout(function(cardRef) {
      this.goBackFromAction(cardRef); // go back before any new DOM nodes will be added to Card deck
      if (cardRef.dataset.name === 'signpost-1') {
        Map.showTargetLocation('Lakeside Camp Resort');
        Map.showTargetLocation('Rocksprings');
      } else if (cardRef.dataset.name === 'signpost-2') {
        Map.showTargetLocation('Litchfield');
      } else if (cardRef.dataset.name === 'signpost-3') {
        Map.showTargetLocation('Greenleafton');
      } else if (cardRef.dataset.name === 'signpost-4') {
        Map.showTargetLocation('Haling Cove');
      } else if (cardRef.dataset.name === 'signpost-5') {
        Map.showTargetLocation('Billibalds Farm');
      } else if (cardRef.dataset.name === 'signpost-6') {
        Map.showTargetLocation('Camp Silverlake');
      } else if (cardRef.dataset.name === 'signpost-7') {
        Map.showTargetLocation('Harbor Gas Station');
      }
      Cards.removeCardFromDeck(cardRef);
    }.bind(this), 1800, cardRef);
  }
}
