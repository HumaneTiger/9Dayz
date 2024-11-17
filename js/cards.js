import Audio from './audio.js'
import Props from './props.js'
import Player from './player.js'
import Items from './items.js'
import Character from './character.js'
import Map from './map.js'
import Actions from './actions.js'
import Tutorial from './tutorial.js'
import Ui from './ui.js'
import CardsMarkup from './cards-markup.js'
import Almanac from './almanac.js'

var cardDeck = [];
var lastHoverTarget;

export default {
  
  init: function() {
    document.body.addEventListener('mouseover', this.checkForCardHover.bind(this));
    document.body.addEventListener('mousedown', this.checkForCardClick.bind(this));
  },

  hourlyTasks: function(hour) {
    if (hour === 21 || hour === 5) {
      this.switchDayNight();
    }
  },

  checkForCardClick: function(ev) {

    const target = ev.target;
    const cardId = target.closest('div.card')?.id;
    const actionButton = target.closest('div.action-button');
    const itemContainer = target.closest('li.item:not(.is--hidden)');
    const leftMouseButton = (ev.button === 0);
    const rightMouseButton = (ev.button === 2);

    if (cardId && !Props.getGameProp('gamePaused')) {
      const object = Props.getObject(cardId);
      const cardRef = this.getCardById(cardId);

      ev.preventDefault();
      ev.stopPropagation();

      if (actionButton && leftMouseButton && !object.disabled) {
        const action = actionButton.dataset.action;
        const actionObject = object.actions.find(singleAction => singleAction.id === action);

        if (actionObject) {
          if (actionObject.energy && Player.getProp('energy') + actionObject.energy < 0) {
            document.querySelector('#properties li.energy')?.classList.add('heavy-shake');
            window.setTimeout(() => {
              document.querySelector('#properties li.energy')?.classList.remove('heavy-shake');
            }, 200);    
            Audio.sfx('nope');
          } else if (actionObject && !actionObject.locked) {
            Audio.sfx('click');
            Player.lockMovement(true);
            this.disableActions();  
            CardsMarkup.showActionFeedback(cardRef, action);
            if (action !== 'lure') {
              Player.movePlayerTo(object.x, object.y);
            }
            Actions.goToAndAction(cardId, action);
          } else {
            cardRef?.classList.add('card-shake');
            window.setTimeout(() => {
              cardRef?.classList.remove('card-shake');
            }, 200);    
            Audio.sfx('nope');
          }  
        }
      }
      if (itemContainer) {
        const itemName = itemContainer?.dataset.item;
        const itemAmount = object.items.find(singleItem => singleItem.name === itemName)?.amount;
        const itemProps = Props.getItem(itemName);

        if (itemAmount && leftMouseButton) {
          if (itemProps && itemProps[0] === 'extra') {
            // spawn weapon as card
            Props.setupWeapon(Player.getPlayerPosition().x, Player.getPlayerPosition().y, itemName);
          } else if (itemName === 'crate') {            
            Props.setupBuilding(Player.getPlayerPosition().x, Player.getPlayerPosition().y, [itemName]);
          } else {
            Props.addItemToInventory(itemName, itemAmount);
          }
          object.items.find(singleItem => singleItem.name === itemName).amount = 0;
          itemContainer.classList.add('transfer');
          Items.inventoryChangeFeedback();
          Items.fillInventorySlots();
          Audio.sfx('pick', 0, 0.1);
          window.setTimeout((itemContainer) => {
            if (cardRef) {
              itemContainer.classList.add('is--hidden');
              if (itemName === 'crate' || itemProps[0] === 'extra') { Player.findAndHandleObjects(); } // this LOC must be placed here, otherwise the "grab slot" for weapons isn't removed correctly
              if (object.items.filter(singleItem => singleItem.amount > 0).length === 0 &&
                  !cardRef.querySelectorAll('ul.items li.preview:not(.is--hidden)')?.length) {
                this.renderCardDeck();
              }
            }
          }, 400, itemContainer);
        } else if (itemAmount && rightMouseButton) {
          // make item known to inventory
          if (itemProps && itemProps[0] === 'extra') {
            Props.addWeaponToInventory(itemName, 0, {durability: 0});
          } else {
            Props.addItemToInventory(itemName, 0); 
          }
          Almanac.showPage(itemName, 'item', itemContainer.closest('ul.items'), cardRef);
        }
      }
    }
  },

  checkForCardHover: function(ev) {

    const target = ev.target;

    const cardId = target.closest ? target.closest('div.card')?.id : null;
    const hoverButton = target.closest ? target.closest('div.action-button') : null;

    if (!Props.getGameProp('gamePaused')) {
      if (!cardId || cardId !== lastHoverTarget) {
        const cardRef = this.getCardById(lastHoverTarget);
        if (cardRef) {
          if (!Props.getGameProp('battle')) {
            cardRef.style.zIndex = cardRef.dataset.oldZindex;
          }
          delete cardRef.dataset.oldZindex;
          Map.noHighlightObject(lastHoverTarget);
          lastHoverTarget = undefined;  
        }
      }
      if (cardId) {
        if (lastHoverTarget !== cardId) {
          lastHoverTarget = cardId;
          const cardRef = this.getCardById(cardId);
          if (!Props.getGameProp('battle')) {
            cardRef.dataset.oldZindex = cardRef.style.zIndex;
            cardRef.style.zIndex = 200;  
          }
          if (hoverButton) {
            cardRef.classList.add('hover-button');
          } else {
            cardRef.classList.remove('hover-button');
          }  
          Map.highlightObject(cardId);
        }
        if (hoverButton) {
          const action = hoverButton.dataset?.action;
          if (action && (action === 'rest' || action === 'sleep')) {
            this.previewStatsChange(action, cardId);
          }
        } else {
          Player.resetPreviewProps();
        }
      }  
    }
  },

  previewStatsChange: function(action, cardId) {
    const object = Props.getObject(cardId);
    const actionObject = object.actions.find(singleAction => singleAction.id === action);
    if (!actionObject.locked) {
      let energy = actionObject.energy;
      if (actionObject.id === 'rest') {
        if (Props.getGameProp('timeMode') === 'night') { energy += 5 };
        Player.previewProps('health', Math.floor(energy / 2));
        Player.previewProps('food', -10);
        Player.previewProps('thirst', -14);
        Player.previewProps('energy', energy);      
      } else if (actionObject.id === 'sleep') {
        if (Props.getGameProp('timeMode') === 'night') { energy += 20 };
        Player.previewProps('health', Math.floor(energy / 2));
        Player.previewProps('food', -18);
        Player.previewProps('thirst', -24);
        Player.previewProps('energy', energy);      
      }
    }
  },

  getCardById: function(cardId) {
    return document.getElementById(cardId);
  },

  getAllZedsNearbyIds: function() {
    let allZeds = [];
    cardDeck?.forEach(card => {
      const id = card.id;
      let object = Props.getObject(id);
      if (object.group === 'zombie' && object.distance < 2.5 && !object.dead) {
        allZeds.push(id);
      }
    });
    return allZeds;
  },

  showAllZedsNearby: function() {
    cardDeck?.forEach(card => {
      let object = Props.getObject(card.id);
      if (object.group === 'zombie' && object.distance < 2.5 && !object.dead) {
        const cardRef = this.getCardById(card.id);
        object.active = true;
        cardRef.classList.remove('is--hidden'); // not strictly needed, but because of timeout crazieness
        cardRef.classList.remove('out-of-queue');
      }
    });
  },

  addObjectsByIds: function(objectIds) {
    if (objectIds !== undefined) {
      objectIds?.forEach(objectId => {
        let object = Props.getObject(objectId);
        if (!object.discovered && !object.removed) {
          cardDeck.push({
            id: objectId,
            distance: 0
          })
        }
      });
    }
    this.renderCardDeck();
  },

  calculateCardDeckProperties: function() {

    const playerPosition = Player.getPlayerPosition();

    cardDeck?.forEach((card, index) => {

      const id = card.id;
      let object = Props.getObject(id);
      let distance = Math.sqrt( Math.pow((playerPosition.x - object.x), 2) + Math.pow((playerPosition.y - object.y), 2) );

      // show event cards always first
      if (object.group === 'event') {
        distance = -1;
      }
      // distance
      object.distance = distance;
      cardDeck[index].distance = distance;

      // active
      if (object.distance > 4) {
        object.active = false;
      }
      if (object.distance < 1.5) {
        object.active = true;
      }

      // too far
      if (object.distance > 1.5) {
        object.inreach = false;
      } else {
        object.inreach = true;
      }

      // zedNearby
      if (object.type !== 'signpost') {
        const allFoundObjectIds = Player.findObjects(object.x, object.y);
        object.zednearby = allFoundObjectIds.some(function(id) {
          return (Props.getObject(id).group === 'zombie' && !Props.getObject(id).dead);
        });
      } else {
        object.zednearby = false;
      }

      // set action states
      object.actions?.forEach(action => {
        action.locked = false;
        if (object.locked && action.needsUnlock) {
          action.locked = true;
        }
        if (!object.inreach && object.group !== 'event') {
          action.locked = true;
        }
        if (object.zednearby && object.group !== 'event' && object.group !== 'zombie' && action.id !== 'scout-area' && action.id !== 'read' && action.id !== 'equip') {
          action.locked = true;
        }
        if (object.infested && (action.id === 'rest' || action.id === 'sleep')) {
          action.locked = true;
        }
        if (action.energy && Player.getProp('energy') + action.energy < 0) {
          action.locked = true;
        }
        if (action.id === 'equip' && object.group === 'weapon' && (Items.inventoryContains(object.name) || Character.numberFilledSlots() >= 2)) {
          action.locked = true;
        }
        if (action.id === 'smash-window') {
          if (!Items.inventoryContains('stone') && !Items.inventoryContains('axe') && !Items.inventoryContains('improvised-axe') && !Items.inventoryContains('wrench')) {
            action.locked = true;
          }
        }
        if (action.id === 'cut-down' || action.id === 'break-door' || action.id === 'break-lock') {
          if (!Items.inventoryContains('axe') && !Items.inventoryContains('improvised-axe')) {
            action.locked = true;
          }
        }
        if (action.id === 'cut') {
          if (!Items.inventoryContains('knife')) {
            action.locked = true;
          }
        }
        if (action.id === 'fish') {
          if (!Items.inventoryContains('fishing-rod')) {
            action.locked = true;
          }
        }
      });

      if (object.actions.filter(singleAction => (singleAction.id === 'search' || singleAction.id === 'gather')).length === 0 && object.items.filter(singleItem => singleItem.amount > 0).length === 0) {
        object.looted = true;
      }

      // no actions and items left: remove Card
      if (!object.actions?.length && object.items.filter(singleItem => singleItem.amount > 0).length === 0) {
        object.removed = true;
      }

    });

  },

  renderCardDeck: function() {

    this.calculateCardDeckProperties();
    this.addSpecialEventCards();
    cardDeck.sort(this.compare);
    
    cardDeck?.forEach(card => {  
      const object = Props.getObject(card.id);
      if (!object.discovered) {
        object.discovered = true;
        CardsMarkup.createCardMarkup(card.id);
        if (object.group === 'zombie') {
          if (object.name === 'rat') {
            Audio.sfx('rat-squeaks');
          } else if (object.name === 'bee') {
            Audio.sfx('bee-appears');
          } else {
            Audio.sfx('zed-appears');
          }
        }
        if (object.group === 'event') {
          if (object.title === 'You found it!') {
            Ui.hideUI();
            document.getElementById('inventory').classList.add('the-end');
          }
        }
      }
    });

    this.updateCardDeck();
    this.cleanupRemovedCards(); // call directly after update, as the removed card effect has to be applied before

    this.switchDayNight();
    this.logDeck();
  },

  updateCardDeck: function() {
    CardsMarkup.updateCardDeckMarkup(cardDeck);
  },

  cleanupRemovedCards: function() {
    // removing all removed ids at the very end outside the foreach
    // doing it the very old school "go backward" way, as this is the most solid approach to avoid any kind of crazy problems
    for (let i = cardDeck.length - 1; i >= 0; i--) {
      const object = Props.getObject(cardDeck[i].id);
      if (object.removed) {
        cardDeck.splice(i, 1);
      }
    }
  },

  addSpecialEventCards: function() {

    if (Props.getGameProp('tutorial')) {

      const specialEventObjectIds = Tutorial.checkForSpecialEvents(cardDeck);

      specialEventObjectIds?.forEach(objectId => {
        let object = Props.getObject(objectId);
        if (!object.discovered && !object.removed) {
          cardDeck.push({
            id: objectId,
            distance: -1
          })
        }
      });
    }
  },

  logDeck: function() {},

  switchDayNight: function() {
    cardDeck?.forEach((card) => {
      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);
      if (!object.removed) {
        if (object.active) {
          if (Props.getGameProp('timeMode') === 'day') {
            cardRef.classList.remove('night');
            cardRef.classList.add('day');
          } else {
            cardRef.classList.remove('day');
            cardRef.classList.add('night');
          }
        }
      }
    });
  },

  disableActions: function() {
    cardDeck.forEach(function(card, index) {
      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);
      if (object.group !== 'event') {
        object.disabled = true;
        cardRef.classList.add('actions-locked');  
      }
    });
    document.querySelector('#craft')?.classList.add('actions-locked');
    document.querySelector('#character')?.classList.add('actions-locked');
  },

  enableActions: function() {
    cardDeck.forEach(function(card, index) {
      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);
      object.disabled = false;
      cardRef.classList.remove('actions-locked');  
    });
    document.querySelector('#craft')?.classList.remove('actions-locked');
    document.querySelector('#character')?.classList.remove('actions-locked');
  },

  removeCard: function(cardId) {
    const object = Props.getObject(cardId);
    object.removed = true;
  },

  compare: function( a, b ) {
    if ( a.distance < b.distance ){
      return -1;
    }
    if ( a.distance > b.distance ){
      return 1;
    }
    return 0;
  }

}
