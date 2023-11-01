import Props from './props.js'
import Audio from './audio.js'
import Player from './player.js'
import Cards from './cards.js'
import CardsMarkup from './cards-markup.js'
import Map from './map.js'
import Items from './items.js'
import Battle from './battle.js'
import Cooking from './cooking.js'

export default {
  
  init: function() {
  },

  goToAndAction: function(cardId, action) {
    window.setTimeout(function(cardId, action) {
      const object = Props.getObject(cardId);
      const actionObject = object.actions.find(singleAction => singleAction.id === action);
      if (actionObject) {
        if (action === 'search') {
          this.simulateGathering(cardId, actionObject.time, actionObject.energy);
        } if (action === 'cut') {
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
          this.simulateCooking(cardId);
        } else if (action === 'equip') {
          this.simulateEquipping(cardId);
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
        console.log('No action object for: ' + action);
      }
      /* optional: hide 1-time actions */
      if (action && action !== 'rest' && action !== 'sleep' && action !== 'drink' && action !== 'cook') {
        for (let i = object.actions.length - 1; i >= 0; i--) {
          if (object.actions[i].id === action) {
            if (!(object.infested && action === 'search')) {
              const cardRef = Cards.getCardById(cardId);
              cardRef.querySelector('li.' + action).remove();
              object.actions.splice(i, 1);  
            }
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
    let cardRef = Cards.getCardById(cardId);
    CardsMarkup.hideActionFeedback(cardRef);
  },

  fastForward: function(callbackfunction, cardId, time, newSpeedOpt, energy) {
    const defaultSpeed = Props.getGameProp('speed');
    const newSpeed = newSpeedOpt || 400;
    if (time) {
      let ticks = parseInt(time) / 10;
      Props.setGameProp('speed', newSpeed);
      window.setTimeout(function(defaultSpeed, cardId) {
        Props.setGameProp('speed', defaultSpeed);
        callbackfunction.call(this, cardId, energy);
      }.bind(this), ticks * newSpeed, defaultSpeed, cardId);  
    }
  },

  simulateGathering: function(cardId, time, energy) {

    const object = Props.getObject(cardId);
    const cardRef = Cards.getCardById(cardId);
    const allItems = object.items;
    // first car/house/train always has a tape
    if (!Props.getGameProp('firstSearch') && (object.type === 'car' || object.type === 'house' || object.type === 'train') && cardRef.querySelector('ul.items')) {
      Props.setGameProp('firstSearch', true);
      // replace first item in data and markup
      // but only if the item isn't already there
      if (!allItems.some(el => (el.name === 'tape' && el.amount > 0))) {
        allItems[0] = {name: 'tape', amount: 1};
        cardRef.querySelector('ul.items li.preview').remove();
        cardRef.querySelector('ul.items li.item').remove();
        cardRef.querySelector('ul.items').innerHTML = CardsMarkup.generateItemMarkup('tape', 1) + cardRef.querySelector('ul.items').innerHTML;  
      }
    }
    let allPreviews = cardRef.querySelectorAll('ul.items li.preview');

    let timeout = 2000;
    let delay = 2000;

    if (object.infested) {
      const ratObjectIds = Props.spawnRatsAt(object.x, object.y);
      cardRef.classList.remove('infested');
      object.actions?.forEach(action => {
        // search action not critical any more
        if (action.name === 'search') {
          action.critical = false;
        }
      });
      Player.handleFoundObjectIds(ratObjectIds);
      window.setTimeout(function() {
        object.infested = false;
        this.endAction(cardId);
        Battle.startBattle();
      }.bind(this), 1200);
    } else if (allPreviews) {
      cardRef.querySelector('ul.items')?.classList.remove('is--hidden');
      allPreviews[0].querySelector('.unknown').classList.add('is--hidden');
      allPreviews[0].querySelector('.searching').classList.remove('is--hidden');
      if (object.type === 'house' && Math.random() < 0.25) {
        Props.setupBuilding(object.x, object.y, ['human-corpse-1']);
      }
      for (let i = 0; i < allItems.length; i += 1) {
        window.setTimeout(function(index, item, cardId, energy) {
          allPreviews[index].classList.add('is--hidden');
          if (item.amount > 0) {
            if (item.name === 'duck' || item.name === 'froggy') {
              Props.spawnAnimalAt(item.name, object.x, object.y);
              cardRef.querySelector('ul.items li[data-item="' + item.name + '"].is--hidden').dataset.amount = 0;
              item.amount = 0;
            } else {
              cardRef.querySelector('ul.items li[data-item="' + item.name + '"].is--hidden').classList.remove('is--hidden');
            }
          }
          if (index + 1 < allItems.length) {
            allPreviews[index + 1].querySelector('.unknown').classList.add('is--hidden');
            allPreviews[index + 1].querySelector('.searching').classList.remove('is--hidden');        
          }
          if (index + 1 === allItems.length) {
            this.goBackFromAction(cardId);
            Player.changeProps('energy', energy);
            if (!allItems.some(function(item) { return (item.amount > 0); })) {
              cardRef.querySelector('ul.items').remove();
              cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
              cardRef.classList.add('looted');
              // check if card can be removed (no actions left)
              Cards.renderCardDeck();
            }
          }
        }.bind(this), i * timeout + delay, i, allItems[i], cardId, energy);
      }
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
      this.checkForInfested(cardId);
    }, cardId, time, 800, energy);
  },

  simulateResting: function(cardId, time, energy) {

    Map.showScoutMarkerFor(cardId);
    if (Props.getGameProp('timeMode') === 'night') { energy += 5 };

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
    if (Props.getGameProp('timeMode') === 'night') { energy += 20 };

    this.fastForward(function(cardId, energy) {
      Player.changeProps('energy', energy);
      Player.changeProps('health', Math.floor(energy / 2));
      Player.changeProps('food', -18);
      Player.changeProps('thirst', -24);
      Map.hideScoutMarker();
      this.goBackFromAction(cardId);
    }, cardId, time, 100, energy);
  },

  simulateCooking: function(cardId) {
    /* simulate cooking inside Fireplace Card */
    const cardRef = Cards.getCardById(cardId);
    window.setTimeout(() => {
      Cooking.start(cardRef);
      this.goBackFromAction(cardId);
    }, 800);
  },

  simulateEquipping: function(cardId) {
    const object = Props.getObject(cardId);
    if (object.group === 'weapon' && object.name) {
      Props.addToInventory(object.name, 1, 3);
    }
    window.setTimeout(function(cardId) {
      Items.inventoryChangeFeedback();
      Items.fillInventorySlots();
      this.goBackFromAction(cardId);
    }.bind(this), 800, cardId);
  },

  simulateCuttingDown: function(cardId, time, energy) {

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    const object = Props.getObject(cardId);
    object.removed = true;

    this.fastForward(function(cardId, energy) {
      this.goBackFromAction(cardId);
      Props.addToInventory('improvised-axe', 0, -1);
      Props.addToInventory('stump', 1); 
      Props.addToInventory('branch', 2 + Math.round(Math.random() - 0.25));
      Items.inventoryChangeFeedback();
      Items.fillInventorySlots();
      Player.changeProps('energy', energy);
    }, cardId, time, 800, energy);
  },

  simulateLuring: function(cardId, time, energy) {

    Player.lockMovement(true);
    Cards.disableActions();

    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(Player.getPlayerPosition().x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(Player.getPlayerPosition().y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');
    
    this.fastForward(function(cardId, energy) {

      this.endAction(cardId);

      Map.hideScoutMarker();

      // 60:40 chance it works
      if (Math.random() >= 0.4) {
        Battle.startBattle(false, cardId);
      } else {
        const cardRef = Cards.getCardById(cardId);
        Cards.enableActions();
        Player.lockMovement(false);
        Player.changeProps('energy', energy);
        Audio.sfx('nope');
        cardRef?.classList.add('card-heavy-shake');
        window.setTimeout(() => {
          cardRef?.classList.remove('card-heavy-shake');
        }, 200);
        Cards.renderCardDeck();
      }
    }, cardId, time, 1600, energy);
  },

  simulateAttacking: function(cardId) {

    const object = Props.getObject(cardId);
    const allFoundObjectIds = Player.findObjects(object.x, object.y);

    const zedsOnly = allFoundObjectIds.filter(singleObject => Props.getObject(singleObject).group === 'zombie');
    Cards.showAllZedsNearby();
    Player.handleFoundObjectIds(zedsOnly);
    Cards.disableActions();
    
    window.setTimeout(function() {
      this.endAction(cardId);
      Battle.startBattle();
    }.bind(this), 800);

  },

  gotIt: function(cardId) {
    const object = Props.getObject(cardId);
    if (object && object.title === 'You found it!') {
      Player.checkForWin();
    } else if (object.title === 'Waking Up') {
      document.getElementById('player').classList.remove('highlight');
      document.getElementById('player-hint').classList.add('is--hidden');
    }
    Cards.removeCard(cardId);
    Player.lockMovement(false);
    Player.updatePlayer(true);
    Cards.renderCardDeck();
  },

  simulateBreaking: function(cardId, time, energy) {

    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);  

    this.fastForward(function(cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      Props.addToInventory('improvised-axe', 0, -1);
      Items.fillInventorySlots();
      Player.changeProps('energy', energy);
      this.goBackFromAction(cardId);
      this.checkForInfested(cardId);
    }, cardId, time, 800, energy);
  },

  checkForInfested: function(cardId) {
    const cardRef = Cards.getCardById(cardId);
    const object = Props.getObject(cardId);
    if (object.infested && !object.locked) {
      const ratObjectIds = Props.spawnRatsAt(object.x, object.y);
      cardRef.classList.remove('infested');
      object.infested = false;
      object.actions?.forEach(action => {
        // search action not critical any more
        if (action.name === 'search') {
          action.critical = false;
        }
      });
      Player.handleFoundObjectIds(ratObjectIds);
    }
  },

  simulateSmashing: function(cardId, time, energy) {

    Audio.sfx('break-glass', 350);

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
      Audio.sfx('note');
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
