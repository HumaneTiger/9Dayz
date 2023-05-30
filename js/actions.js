import Audio from './audio.js'
import Props from './props.js'
import Player from './player.js'
import Cards from './cards.js'
import Map from './map.js'
import Items from './items.js'
import Battle from './battle.js'

export default {
  
  init() {
  },

  goToAndAction: function(cardId, action) {
    window.setTimeout(function(cardId, action) {
      const object = Props.getObject(cardId);
      const actionObject = object.actions.filter(singleAction => singleAction.id === action)[0];
      if (actionObject) {
        if (action === 'search') {
          this.simulateGathering(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'gather') {
          this.simulateGathering(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'scout-area') {
          this.simulateScouting(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'rest') {
          this.simulateResting(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'sleep') {
          this.simulateSleeping(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'cook') {
          this.simulateCooking();
        } else if (action === 'cut-down') {
          this.simulateCuttingDown(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'smash-window') {
          this.simulateSmashing(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'break-door') {
          this.simulateBreaking(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'attack') {
          this.simulateAttacking(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'lure') {
          this.simulateLuring(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'got-it') {
          this.gotIt(cardId);
        } else if (action === 'read') {
          this.reading(cardId, actionObject.time, actionObject.energy);
        } else if (action === 'drink') {
          this.drinking(cardId, actionObject.time, actionObject.energy);
        } else {
          console.log('Unknown action: ' + action);
        }
      } else {
        console.log('Unknown action: ' + action);
      }
      /* optional: hide 1-time actions */
      if (action) {
        for (let i = object.actions.length - 1; i >= 0; i--) {
          if (object.actions[i].id === action) {
            const cardRef = Cards.getCardById(cardId);
            cardRef.querySelector('li.' + action).remove();
            object.actions.splice(i, 1);
          }
        }
      }
    }.bind(this), (action === 'got-it' || action === 'gather' || action === 'search') ? 0 : 1000, cardId, action);
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
        allPreviews[index - 1].classList.add('is--hidden');
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

    const object = Props.getObject(cardId);
    object.removed = true;

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
        Battle.startBattle(false, cardId);
      } else {
        Cards.enableActions();
        Player.lockMovement(false);
        Player.changeProps('energy', energy);
        Audio.sfx('nope');
        Cards.renderCardDeck();
      }
    }, cardId, time, 1600, energy);
  },

  simulateAttacking: function(cardId) {

    const object = Props.getObject(cardId);
    const allFoundObjectIds = Player.findObjects(object.x, object.y);

    const zedsOnly = allFoundObjectIds.filter(singleObject => singleObject.group === 'zombie');
    Player.handleFoundObjectIds(zedsOnly);
    Cards.renderCardDeck();

    window.setTimeout(function() {
      this.endAction(cardId);
      Battle.startBattle();
    }.bind(this), 800);

  },

  gotIt: function(cardId) {
    /*
    const cardRef = Cards.getCardById(cardId);
    if (cardRef.dataset.x === "30" && cardRef.dataset.y === "7") {
      Player.checkForWin();
    }*/
    Cards.removeCard(cardId);
    Player.lockMovement(false);
    Player.updatePlayer(true);
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
