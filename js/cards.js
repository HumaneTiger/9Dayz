import Audio from './audio.js'
import Props from './props.js'
import Player from './player.js'
import Items from './items.js'
import Map from './map.js'
import Actions from './actions.js'
import Cooking from './cooking.js'
import Ui from './ui.js'

const cardsContainer = document.getElementById('cards');
const cardWidth = 380 * 0.8;
const zIndexBase = 200;

var cardDeck = [];
var lastHoverTarget;

export default {
  
  init() {
    document.body.addEventListener('mouseover', this.checkForCardHover.bind(this));
    //document.body.addEventListener('mouseout', this.checkForCardUnHover.bind(this));
    document.body.addEventListener('mousedown', this.checkForCardClick.bind(this));
  },

  checkForCardClick: function(ev) {

    const target = ev.target;
    const cardId = target.closest('div.card')?.id;
    const actionButton = target.closest('div.action-button');
    const itemContainer = target.closest('li.item:not(.is--hidden)');

    if (cardId) {
      const object = Props.getObject(cardId);

      ev.preventDefault();
      ev.stopPropagation();

      if (actionButton && !object.disabled) {
        const action = actionButton.dataset.action;
        const actionObject = object.actions.find(singleAction => singleAction.id === action);
  
        if (actionObject) {
          if (actionObject.energy && Player.getProp('energy') + actionObject.energy < 0) {
            // shake energy meter
            Audio.sfx('nope');
          } else if (actionObject && !actionObject.locked) {
            Audio.sfx('click');
            Player.lockMovement(true);
            this.disableActions();  
            this.showActionFeedback(cardId, action);
            if (action !== 'lure') {
              Player.movePlayerTo(object.x, object.y);
            }
            Actions.goToAndAction(cardId, action);
          } else {
            Audio.sfx('nope');
          }  
        }
      }
      if (itemContainer) {
        const itemName = itemContainer?.dataset.item;
        const itemAmount = object.items.find(singleItem => singleItem.name === itemName)?.amount;
        if (itemAmount) {
          Props.addToInventory(itemName, itemAmount);
          object.items.find(singleItem => singleItem.name === itemName).amount = 0;
          itemContainer.classList.add('transfer');
          Items.inventoryChangeFeedback();
          Items.fillInventorySlots();
          Audio.sfx('pick', 0, 0.1);
          window.setTimeout((itemContainer, cardId) => {
            const cardRef = this.getCardById(cardId);
            const object = Props.getObject(cardId);
            if (cardRef) {
              itemContainer.classList.add('is--hidden');
              if (object.items.filter(singleItem => singleItem.amount > 0).length === 0 &&
                  !cardRef.querySelectorAll('ul.items li.preview:not(.is--hidden)')?.length) {
                this.renderCardDeck();
              }
            } else {
              console.log('No Card found for ' + cardId);
            }
          }, 400, itemContainer, cardId);
        }
      }
    }
  },

  checkForCardHover: function(ev) {

    const target = ev.target;
    const cardId = target.closest('div.card')?.id;
    const hoverButton = target.closest('div.action-button');

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
    }
  },

  checkForCardUnHover: function(ev) {
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
        cardRef.classList.remove('is--hidden'); // not strictly needed, but becuase of timeout crazieness
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
        if (action.id === 'smash-window') {
          if (!Items.inventoryContains('stone') && !Items.inventoryContains('axe') && !Items.inventoryContains('improvised-axe')) {
            action.locked = true;
          }
        }
        if (action.id === 'cut-down' || action.id === 'break-door') {
          if (!Items.inventoryContains('axe') && !Items.inventoryContains('improvised-axe')) {
            action.locked = true;
          }
        }
        if (action.id === 'cut') {
          if (!Items.inventoryContains('knife')) {
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
    this.checkForSpecialEvents();
    cardDeck.sort(this.compare);
    
    cardDeck?.forEach(card => {  
      const object = Props.getObject(card.id);
      if (!object.discovered) {
        object.discovered = true;
        this.createCardMarkup(card.id);
        if (object.group === 'zombie') {
          if (object.name === 'rat') {
            Audio.sfx('rat-squeaks');
          } else {
            Audio.sfx('zed-appears');
          }
        }
        if (object.group === 'event') {
          if (object.title === 'You found it!') {
            Ui.hideUI();
            document.getElementById('inventory').classList.add('the-end'); // weapons cover last event card which is bad.
          }
        }
      }
    });

    this.refreshCardDeck();
    this.logDeck();
  },

  checkForSpecialEvents: function() {

    if (Props.getGameProp('tutorial')) {

      const playerPosition = Player.getPlayerPosition();
      const crafting = Props.getCrafting();
      let specialEventObjectIds = [];

      cardDeck?.forEach((card) => {

        const id = card.id;
        let object = Props.getObject(id);

        if (object.infested && !Props.getGameProp('firstInfestation')) {
          Props.setGameProp('firstInfestation', true);
          let objectId = Props.setupSpecialEvent('infestation', playerPosition.x, playerPosition.y);
          specialEventObjectIds.push(objectId);
        }
        if (object.locked && !Props.getGameProp('firstLocked')) {
          Props.setGameProp('firstLocked', true);
          if (object.type === 'car') {
            let objectId = Props.setupSpecialEvent('locked-car', playerPosition.x, playerPosition.y);
            specialEventObjectIds.push(objectId);
          } else {
            let objectId = Props.setupSpecialEvent('locked-building', playerPosition.x, playerPosition.y);
            specialEventObjectIds.push(objectId);
          }
        }
        if (object.zednearby && !Props.getGameProp('firstZedNearby')) {
          Props.setGameProp('firstZedNearby', true);
          let objectId = Props.setupSpecialEvent('hostiles-nearby', playerPosition.x, playerPosition.y);
          specialEventObjectIds.push(objectId);
        }
        if (crafting.total && !Props.getGameProp('firstCraft')) {
          Props.setGameProp('firstCraft', true);
          let objectId = Props.setupSpecialEvent('crafting', playerPosition.x, playerPosition.y);
          specialEventObjectIds.push(objectId);
        }
        /*if (object.toBeImplented && !Props.getGameProp('firstRatFight')) {
          Props.setGameProp('firstRatFight', true);
          console.log('firstRatFight');
        }
        if (object.toBeImplented && !Props.getGameProp('firstRatKill')) {
          Props.setGameProp('firstRatKill', true);
          console.log('firstRatKill');
        }*/

      });

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

  logDeck: function() {
    /*
    const cardConsole = document.getElementById('card-console');
    cardConsole.innerHTML = '';
    cardDeck?.forEach(card => {  
      cardConsole.innerHTML += '<p>';
      const object = Props.getObject(card.id);
      cardConsole.innerHTML = cardConsole.innerHTML + card.id + ': ';
      cardConsole.innerHTML = cardConsole.innerHTML + JSON.stringify(object).replaceAll('","', '", "').replaceAll('":"', '": "').replaceAll('":', '": ').replaceAll('<img', '') + ' ';
      cardConsole.innerHTML += '</p>';
    });
    */
  },

  refreshCardDeck: function() {

    const playerPosition = Player.getPlayerPosition();
    let cardLeftPosition = 0;

    // Position (top / bottom)
    if (playerPosition.y < 15) {
      cardsContainer.classList.add('cards-at-bottom');
    } else {
      cardsContainer.classList.remove('cards-at-bottom');
    }

    cardDeck?.forEach((card, index) => {

      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);

      if (!object.removed) {

        if (object.active) {

          // move new cards into place
          window.setTimeout((cardRef) => {
                    
            if (cardRef.style.top === '600px') {
              cardRef.style.top = '';
              Audio.sfx('deal-card');
            }

            if (!cardRef.classList.contains('fight')) {
              if (cardRef.style.left !== cardLeftPosition + 'px') {
                cardRef.style.transform = '';
                cardRef.style.left = cardLeftPosition + 'px';
                cardRef.style.zIndex = zIndexBase - index;
                delete cardRef.dataset.oldZindex;
              }
            }

            if (cardDeck.length < 7 || index < 3) {
              cardLeftPosition += Math.floor(cardWidth);
            } else {
              cardLeftPosition += Math.floor(cardWidth / (index - 1.95));
            }

          }, 300 + 100 * index, cardRef);

          if (object.locked) {
            cardRef.classList.add('locked');
          } else {
            cardRef.classList.remove('locked');
          }
          // need object prop for 'lootable', can also be used in props.js for action combos that make no sense */
          if (object.looted && !(object.name.startsWith('signpost') || object.name === 'pump' || object.name === 'fireplace' || object.name === 'well')) {
            cardRef.querySelector('ul.items')?.remove();
            cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
            cardRef.classList.add('looted');
          } else {
            cardRef.classList.remove('looted');
          }
          if (object.infested) {
            cardRef.classList.add('infested');
          } else {
            cardRef.classList.remove('infested');
          }
          if (object.zednearby) {
            cardRef.classList.add('zombieshere');
          } else {
            cardRef.classList.remove('zombieshere');
          }
          if (object.distance > 1) {
            cardRef.querySelector('.distance').textContent = Math.round(object.distance * 4.4) + ' min';
            if (!object.inreach) Cooking.end(cardRef);
          } else {
            cardRef.querySelector('.distance').textContent = 'Here';
          }

          cardRef.classList.remove('is--hidden');
        }

        // deactivate cards
        if (!object.active) {
          window.setTimeout((cardId) => {
            const object = Props.getObject(cardId);
            const cardRef = this.getCardById(cardId);

            cardRef.style.left = Math.round(parseInt(object.x) * 44.4 - 120) + 'px';
            cardRef.style.top = '600px';
            cardRef.style.transform = 'scale(0.4)';
            cardRef.style.opacity = 0;

            window.setTimeout(function(cardRef, object) {
              if (object.group === 'event') {
                object.removed = true;
              } else {
                cardRef.classList.add('is--hidden');
                cardRef.style.opacity = 1;
              }
            }, 300, cardRef, object);
          }, 300, card.id);
        }
      }

      object.actions?.forEach(action => {
        let actionRef = cardRef.querySelector('ul.actions li.' + action.id);
        if (action.locked) {
          if (!object.inreach) {
            actionRef.querySelector('.additional-locked').textContent = 'Too far away';
          } else if (object.zednearby) {
            actionRef.querySelector('.additional-locked').textContent = 'Hostiles nearby';
          } else if (action.id === 'cut-down' || action.id === 'break-door') {
            actionRef.querySelector('.additional-locked').textContent = 'Axe needed';        
          } else if (action.id === 'cut') {
            actionRef.querySelector('.additional-locked').textContent = 'Knife needed';        
          } else if (action.id === 'smash-window') {
            actionRef.querySelector('.additional-locked').textContent = 'Axe or Stone needed';
          } else {
            actionRef.querySelector('.additional-locked').textContent = 'Locked';
          }
          actionRef.classList.add('locked');
        } else {
          actionRef.classList.remove('locked');
        }
        if ((action.id === 'search' || action.id === 'cut') && object.dead === false) {
          actionRef.classList.add('is--hidden');
        } else {
          actionRef.classList.remove('is--hidden');
        }
        if (action.critical) {
          actionRef.classList.add('critical');
          actionRef.querySelector('span.text').innerHTML = '<span class="material-symbols-outlined">release_alert</span> ' + action.label;
        } else {
          actionRef.classList.remove('critical');
          actionRef.querySelector('span.text span.material-symbols-outlined').classList.add('is--hidden');
        }
      });

      if (object.removed) {
        if (cardRef) {
          cardRef.classList.add('remove');
          Map.removeObjectIconById(card.id);
          window.setTimeout(function(removeCard) {
            removeCard.remove();
          }, 300, cardRef);
        }
      }
    });

    // removing all removed ids at the very end outside the foreach
    // doing it the very old school "go backward" way, as this is the most solid approach to avoid any kind of crazy problems

    for (let i = cardDeck.length - 1; i >= 0; i--) {
      const object = Props.getObject(cardDeck[i].id);
      if (object.removed) {
        cardDeck.splice(i, 1);
      }
    }

  },

  createCardMarkup: function(id) {
    let object = Props.getObject(id);
    let cardMarkupExtension;

    let cardMarkupPre = '<div id="' + id + '" class="card ' + (object.locked ? 'locked ' : '') + (object.dead ? 'dead ' : '') + ' ' + object.group + '" style="left: ' + Math.round(object.x * 44.4 - 120) + 'px; top: 600px; transform: scale(0.4);">' +
                          '<div class="inner">';

    let cardMarkupBuilding = '<div class="status"><div class="status-locked"></div><div class="status-zombies"></div><div class="status-looted"></div><div class="status-infested"></div></div>' +
                             '<h2>' + object.title + '</h2>' +
                             '<p class="activity glow is--hidden"></p>' +
                             '<img class="motive" src="./img/buildings/' + (object.name.startsWith('signpost-') ? 'signpost' : object.name) + '.png">' +
                             '<div class="banner"><img src="./img/icons/buildings/' + object.type + '.png"></div>';

    let cardMarkupZombie =   '<div class="attack">' + object.attack + '</div><div class="health">' + object.defense + '</div>' +
                             '<p class="activity glow is--hidden"></p>' +
                             '<img class="motive" src="./img/zombies/' + object.name + '.png">' +
                             '<div class="dead"><img src="./img/zombies/' + (object.name === 'rat' ? 'dead' : 'undead') + '.png"></div>';

    let cardMarkupWeapon =   '<div class="attack">' + object.attack + '</div><div class="shield">' + object.defense + '</div>' +
                             '<p class="activity glow is--hidden"></p>' +
                             '<img class="motive" src="./img/weapons/' + object.name + '.png">' +
                             '<div class="banner"><img src="./img/icons/weapons/' + object.group + '.png"></div>';

    let cardMarkupAnimal =   '<p class="activity glow is--hidden"></p>' +
                             '<img class="motive" src="./img/items/' + object.name + '.PNG">' +
                             '<div class="banner"><img src="./img/icons/animals/animal.png"></div>' +
                             '<div class="dead"><img src="./img/zombies/dead.png"></div>';

    let cardMarkupEvent =    '<h2>' + object.title + '</h2>' +
                             '<p class="text">' + object.text + '</p>';
                 
    let cardMarkupPost =  '</div>' +
                        '<span class="distance">' + (object.distance > 1 ? Math.round(object.distance * 4.4) + ' min' : 'Here') + '</span>' +
                      '</div>';

    if (object.name === 'fireplace') {
      cardMarkupExtension = '<ul class="cooking">';
      let cookingRecipes = Props.getCookingRecipes();
      for (const recipe in cookingRecipes) {
        cardMarkupExtension += '<li>'
        cardMarkupExtension += '<div class="slot unknown item-'+cookingRecipes[recipe][0]+'" data-item="'+cookingRecipes[recipe][0]+'"><img src="./img/items/'+cookingRecipes[recipe][0]+'.PNG" class="bg"><span class="unknown">?</span><span class="amount"></span></div>';
        cardMarkupExtension += '<div class="slot operator"><span class="sign">+</span></div>';
        cardMarkupExtension += '<div class="slot unknown item-'+cookingRecipes[recipe][1]+'" data-item="'+cookingRecipes[recipe][1]+'"><img src="./img/items/'+cookingRecipes[recipe][1]+'.PNG" class="bg"><span class="unknown">?</span><span class="amount"></span></div>';
        cardMarkupExtension += '<div class="slot operator"><span class="sign">=</span></div>';
        cardMarkupExtension += '<div class="slot action unknown item-'+recipe+'" data-item="'+recipe+'"><img src="./img/items/'+recipe+'.PNG" class="bg"><span class="unknown">?</span><span class="amount">'+cookingRecipes[recipe][2]+'</span><span class="action">'+cookingRecipes[recipe][3]+'</span></div>';
        cardMarkupExtension += '</li>'
      }
      cardMarkupExtension += '<li class="action"><div class="action-button" data-action="close-cooking"><span class="text">Back</span></div></li>'
      cardMarkupExtension += '</ul>'
    }

    // generate action markup
    let actionList = '';
    object.actions?.forEach(action => {
      let additionInfo = '';

      if (action.time || action.energy) {
        additionInfo = '<span class="additional">';
        if (action.time) {
          additionInfo += action.time + ' min';
        }
        if (action.energy) {
          additionInfo += ' | ' + action.energy + '<span class="material-symbols-outlined energy">flash_on</span>';
        }
        additionInfo += '</span>';
      }

      actionList += '<li class="' + action.id + '"><div data-action="' + action.id + '" class="action-button">' +
      '<span class="text"><span class="material-symbols-outlined">lock</span> ' + action.label + '</span>' +
      additionInfo + '<span class="additional-locked"></span></div></li>';
    });

    // generate item markup
    let itemMarkup = '';
    
    for (var i = 0; i < object.items.length; i += 1) {
      itemMarkup += this.generateItemMarkup(object.items[i].name, object.items[i].amount);
    }

    // compile card markup

    let cardMarkup = cardMarkupPre;

    if (object.group === 'building') {
      cardMarkup += cardMarkupBuilding;
    } else if (object.group === 'zombie') {
      cardMarkup += cardMarkupZombie;
    } else if (object.group === 'event') {
      cardMarkup += cardMarkupEvent;
    } else if (object.group === 'weapon') {
      cardMarkup += cardMarkupWeapon;
    } else if (object.group === 'animal') {
      cardMarkup += cardMarkupAnimal;
    }

    if (object.actions.length) {
      cardMarkup = cardMarkup + '<ul class="actions">' + actionList + '</ul>';
    }

    // only cooking for now
    if (cardMarkupExtension) {
      cardMarkup += cardMarkupExtension;
    }

    if (object.items.length) {
      cardMarkup = cardMarkup + '<ul class="items is--hidden">' + itemMarkup + '</ul>';
    }

    cardMarkup += cardMarkupPost;

    cardsContainer.innerHTML += cardMarkup;

  },

  generateItemMarkup: function(name, amount) {
      return '<li class="preview"><span class="unknown">?</span><div class="searching is--hidden"><div></div><div></div></div></li>' +
             '<li class="item is--hidden" data-item="'+name+'" data-amount="'+amount+'"><span class="img"><img src="./img/items/'+name+'.PNG"></span><span class="amount">' + (amount > 1 ? amount : '') + '</span><span class="grab">Grab</span></li>';
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
  },

  enableActions: function() {
    cardDeck.forEach(function(card, index) {
      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);
      object.disabled = false;
      cardRef.classList.remove('actions-locked');  
    });  
  },

  removeCard: function(cardId) {
    const object = Props.getObject(cardId);
    object.removed = true;
  },

  showActionFeedback: function(cardId, actionId) {

    const cardRef = this.getCardById(cardId);
    let text = Props.mapActionsToText(actionId);

    /* hide actions and show feedback */
    cardRef.querySelector('div.banner')?.classList.add('is--hidden');
    cardRef.querySelector('ul.actions')?.classList.add('is--hidden');
    if (cardRef.querySelector('p.activity') !== null) {
      cardRef.querySelector('p.activity').textContent = text;
      cardRef.querySelector('p.activity')?.classList.remove('is--hidden');
    }
  },  
  
  hideActionFeedback: function(cardId) {
    const cardRef = this.getCardById(cardId);
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
