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
    const clickCard = target.closest('div.card');
    const clickButton = target.closest('a.action-button');
    const grabItem = target.closest('li.item:not(.is--hidden)');

    if (clickCard) {
      ev.preventDefault();
      ev.stopPropagation();
      if (clickButton) {
        const action = clickButton.href.split('#')[1];
        const time = clickButton.dataset.time;
        if (action && !clickButton.closest('li').classList.contains('locked')) {
          Audio.sfx('click');
          if (action === 'gather' || action === 'search') {
            this.simulateGathering(clickCard, action, time);
          } else if (action === 'scout-area') {
            this.simulateScouting(clickCard, action, time);
          } else if (action === 'rest') {
            this.simulateResting(clickCard, time);
          } else if (action === 'sleep') {
            this.simulateSleeping(clickCard, time);
          } else if (action === 'cook') {
            this.simulateCooking(clickCard);
          } else if (action === 'cut-down') {
            this.simulateCuttingDown(clickCard, time);
          } else if (action === 'smash-window') {
            this.simulateSmashing(clickCard, time);
          } else if (action === 'break-door') {
            this.simulateBreaking(clickCard, time);
          } else if (action === 'attack') {
            this.simulateAttacking(clickCard);
          } else if (action === 'lure') {
            this.simulateLuring(clickCard, action, time);
          } else if (action === 'got-it') {
            this.gotIt(clickCard);
          } else if (action === 'read') {
            this.reading(clickCard);
          } else if (action === 'drink') {
            this.drinking(clickCard, time);
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

  endAction: function(cardRef) {
    Player.lockMovement(false);
    if (cardRef.querySelector('p.activity')) {
      cardRef.querySelector('p.activity').textContent = '';
      cardRef.querySelector('p.activity').classList.add('is--hidden');  
    }
    cardRef.querySelector('ul.actions')?.classList.remove('is--hidden');
    if (cardRef.querySelector('ul.items')?.classList.contains('is--hidden')) {
      cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
    }
  },

  fastForward: function(callbackfunction, cardRef, time, newSpeedOpt) {
    const defaultSpeed = Props.getGameSpeedDefault();
    const newSpeed = newSpeedOpt || 400;
    if (time) {
      let ticks = parseInt(time) / 10;
      Props.setGameSpeedDefault(newSpeed);
      window.setTimeout(function(defaultSpeed, cardRef) {
        Props.setGameSpeedDefault(defaultSpeed);
        callbackfunction.call(this, cardRef);
      }.bind(this), ticks * newSpeed, defaultSpeed, cardRef);  
    }
  },

  simulateGathering: function(cardRef, action, time) {

    Player.lockMovement(true);
    /* remove selected action */
    cardRef.querySelector('li.' + action).remove();

    let allPreviews = cardRef.querySelectorAll('ul.items li.preview');
    let allItems = cardRef.querySelectorAll('ul.items li.item');

    let timeout = 2000;

    cardRef.querySelector('div.banner')?.classList.add('is--hidden');
    cardRef.querySelector('ul.actions')?.classList.add('is--hidden');

    cardRef.querySelector('ul.items').classList.remove('is--hidden');
    
    /* show activity */
    if (cardRef.querySelector('p.activity')) {
      cardRef.querySelector('p.activity').textContent = action + 'ing...';
      cardRef.querySelector('p.activity').classList.remove('is--hidden');  
    }
    
    allPreviews[0].querySelector('.unknown').classList.add('is--hidden');
    allPreviews[0].querySelector('.searching').classList.remove('is--hidden');

    for (var i = 1; i <= allPreviews.length; i += 1) {
      window.setTimeout(function(index, allPreviews, allItems, cardRef) {
        allPreviews[index - 1].classList.add('is--hidden');
        if (allPreviews[index]) {
          allPreviews[index].querySelector('.unknown').classList.add('is--hidden');
          allPreviews[index].querySelector('.searching').classList.remove('is--hidden');        
        }
        if (allItems[index-1]) {
          allItems[index-1].classList.remove('is--hidden');      
        }
        if (index === allPreviews.length) {
          this.endAction(cardRef);
          Player.lockMovement(false);
        }
      }.bind(this), i * timeout, i, allPreviews, allItems, cardRef);
    }
  },

  simulateScouting: function(cardRef, action, time) {

    Player.lockMovement(true);
    /* remove selected action */
    cardRef.querySelector('li.' + action).remove();

    cardRef.querySelector('div.banner').classList.add('is--hidden');
    cardRef.querySelector('ul.actions').classList.add('is--hidden');

    /* show activity */
    cardRef.querySelector('p.activity').textContent = 'Scouting...';
    cardRef.querySelector('p.activity').classList.remove('is--hidden');

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardRef) {
      this.endAction(cardRef); // has to be right at the beginning
      const x = parseInt(cardRef.dataset.x);
      const y = parseInt(cardRef.dataset.y);
      if (x % 4 === 0 || y % 4 === 0) {
        Map.mapUncoverAt(x, y);
      }
      Player.findBuildings(x, y);
      Player.findZeds(x, y);
      Cards.updateCardDeck();
      document.getElementById('scoutmarker').classList.add('is--hidden');
      Player.lockMovement(false);
    }, cardRef, time, 800);
  },

  simulateResting: function(cardRef, time) {

    Player.lockMovement(true);
    cardRef.querySelector('div.banner').classList.add('is--hidden');
    cardRef.querySelector('ul.actions').classList.add('is--hidden');

    /* show activity */
    cardRef.querySelector('p.activity').textContent = 'Resting...';
    cardRef.querySelector('p.activity').classList.remove('is--hidden');

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(function(cardRef) {
      this.endAction(cardRef); // has to be right at the beginning
      Player.changeProps('energy', 15);
      Player.changeProps('health', 10);
      Player.changeProps('food', -12);
      Player.changeProps('thirst', -15);
      document.getElementById('scoutmarker').classList.add('is--hidden');
      Player.lockMovement(false);
    }, cardRef, time, 800);
  },

  simulateSleeping: function(cardRef, time) {

    Player.lockMovement(true);
    cardRef.querySelector('div.banner').classList.add('is--hidden');
    cardRef.querySelector('ul.actions').classList.add('is--hidden');

    /* show activity */
    cardRef.querySelector('p.activity').textContent = 'Resting...';
    cardRef.querySelector('p.activity').classList.remove('is--hidden');

    const x = parseInt(cardRef.dataset.x);
    const y = parseInt(cardRef.dataset.y);
    const scoutMarker = document.getElementById('scoutmarker');
    scoutMarker.style.left = Math.round(x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    let timeout = 5000;
    // fast forward with the constant effects:
    // - gaining energy (alot)
    // - gaining health (alot)
    // - loosing food
    // - loosing thirst
    window.setTimeout(function(x, y, cardRef) {

      this.endAction(cardRef); // has to be right at the beginning

      Player.changeProps('energy', 90);
      Player.changeProps('health', 50);
      Player.changeProps('food', -35);
      Player.changeProps('thirst', -50);
      document.getElementById('scoutmarker').classList.add('is--hidden');
      Player.lockMovement(false);
  
    }.bind(this), timeout, x, y, cardRef);

  },

  simulateCooking: function() {
    document.getElementById('craft').classList.toggle('active');
    document.getElementById('inventory').classList.remove('active');
  },

  simulateCuttingDown: function(cardRef, time) {

    Player.lockMovement(true);
    cardRef.querySelector('ul.actions').classList.add('is--hidden');

    /* show activity */
    cardRef.querySelector('p.activity').textContent = 'Cutting Down...';
    cardRef.querySelector('p.activity').classList.remove('is--hidden');

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    this.fastForward(function(cardRef) {
      this.endAction(cardRef); // has to be right at the beginning
      if (Props.getGameMode() === 'real') {
        Props.addToInventory('improvised-axe', 0, -1);
      }
      Props.addToInventory('stump', 1); 
      Props.addToInventory('branch', 2);
      Items.inventoryChangeFeedback();
      Items.fillInventorySlots();
      Cards.removeCardFromDeck(cardRef);
      Player.lockMovement(false);
    }, cardRef, time, 800);
  },

  simulateLuring: function(cardRef, action, time) {

    Player.lockMovement(true);
    /* remove selected action */
    cardRef.querySelector('li.' + action)?.remove();

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

    this.fastForward(function(cardRef) {
      this.endAction(cardRef); // has to be right at the beginning
      document.getElementById('scoutmarker').classList.add('is--hidden');
      // 60:40 chance it works
      if (Math.random() >= 0.4) {
        Items.startBattle(false, cardRef);
      } else {
        Player.lockMovement(false);
        Audio.sfx('nope');
        Cards.updateCardDeck();
      }
    }, cardRef, time, 1600);
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

  simulateBreaking: function(cardRef, time) {
    /* remove selected action */
    cardRef.querySelector('li.break-door')?.remove();
    cardRef.querySelector('ul.actions').classList.add('is--hidden');

    /* show activity */
    cardRef.querySelector('p.activity').textContent = 'Breaking Door...';
    cardRef.querySelector('p.activity').classList.remove('is--hidden');

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    this.fastForward(function(cardRef) {
      this.endAction(cardRef); // has to be right at the beginning
      if (Props.getGameMode() === 'real') {
        Props.addToInventory('improvised-axe', 0, -1);
        Items.fillInventorySlots();
      }
      cardRef.classList.remove('locked');
      Player.lockMovement(false);
    }, cardRef, time, 800);
  },

  simulateSmashing: function(cardRef, time) {
    /* remove selected action */
    cardRef.querySelector('li.smash-window')?.remove();
    cardRef.querySelector('ul.actions').classList.add('is--hidden');

    /* show activity */
    cardRef.querySelector('p.activity').textContent = 'Smashing Window...';
    cardRef.querySelector('p.activity').classList.remove('is--hidden');

    Audio.sfx('chop-wood');

    this.fastForward(function(cardRef) {
      this.endAction(cardRef); // has to be right at the beginning
      Player.lockMovement(false);
      cardRef.classList.remove('locked');
    }, cardRef, time, 800);
  },

  drinking: function(cardRef, time) {

    /* show activity */
    cardRef.querySelector('ul.actions').classList.add('is--hidden');
    cardRef.querySelector('p.activity').textContent = 'Drinking...';
    cardRef.querySelector('p.activity').classList.remove('is--hidden');

    Audio.sfx('water');

    this.fastForward(function(cardRef) {
      this.endAction(cardRef); // has to be right at the beginning
      Player.changeProps('thirst', 25);
      Player.lockMovement(false);
    }, cardRef, time, 800);
  },

  reading: function(cardRef) {
    /* remove selected action */
    cardRef.querySelector('li.read')?.remove();
    cardRef.querySelector('ul.actions').classList.add('is--hidden');

    window.setTimeout(function(cardRef) {
      this.endAction(cardRef); // has to be right at the beginning
      Player.lockMovement(false);
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
    }.bind(this), 100, cardRef);
  }
}
