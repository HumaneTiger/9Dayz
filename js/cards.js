import Audio from './audio.js'
import Props from './props.js'
import Player from './player.js'
import Items from './items.js'

const cardsContainer = document.getElementById('cards');
const cardWidth = 380 * 0.8;
const zIndexBase = 200;

var cardDeck = [];

export default {
  
  init() {
  },

  getCardById: function(cardId) {
    return document.getElementById(cardId);
  },

  addObjectsByIds: function(objectIds) {
    if (objectIds !== undefined) {
      objectIds?.forEach(objectId => {
        let object = Props.getObject(objectId);
        if (!object.discovered && !object.removed) {
          cardDeck.push({
            id: objectId,
            distance: 0
          });
        }
      });
    }
    this.renderCardDeck();
  },

  calculateCardDeckProperties: function() {

    const playerPosition = Player.getPlayerPosition();

    cardDeck?.forEach(function(card, index) {

      const id = card.id;
      let object = Props.getObject(id);

      const distance = Math.sqrt( Math.pow((playerPosition.x - object.x), 2) + Math.pow((playerPosition.y - object.y), 2) );

      // distance
      object.distance = distance;
      cardDeck[index].distance = distance;

      // active
      if (object.distance > 4.5) {
        object.active = false;
      } else {
        object.active = true;
      }

      // too far
      if (object.distance > 1.5) {
        object.inreach = false;
      } else {
        object.inreach = true;
      }

      // zedNearby
      const allFoundObjectIds = Player.findObjects(object.x, object.y);
      allFoundObjectIds.forEach(id => {
        if (Props.getObject(id).group === 'zombie' && !Props.getObject(id).dead) {
          object.zednearby = true;
        }
      });

      // set action states
      object.actions?.forEach(action => {
        action.locked = false;
        if (object.locked && action.needsUnlock) {
          action.locked = true;
        }
        if (!object.inreach && object.group !== 'event') {
          action.locked = true;
        }
        if (object.zednearby && object.group !== 'event' && object.group !== 'zombie' && action.id !== 'scout-area' && action.id !== 'read') {
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
      });

      // no actions and items left: remove Card
      if (!object.actions?.length && !object.items?.length) {
        object.removed = true;
      }

    });

    cardDeck.sort(this.compare);
    
  },

  renderCardDeck: function() {
   
    this.calculateCardDeckProperties();

    cardDeck?.forEach(card => {  
      const object = Props.getObject(card.id);
      if (!object.discovered) {
        object.discovered = true;
        this.createCardMarkup(card.id);
      }
    });

    this.refreshCardDeck();
    this.logDeck();
  },

  logDeck: function() {
    const cardConsole = document.getElementById('card-console');
    cardConsole.innerHTML = '';
    cardDeck?.forEach(card => {  
      cardConsole.innerHTML += '<p>';
      const object = Props.getObject(card.id);
      cardConsole.innerHTML = cardConsole.innerHTML + card.id + ': ';
      cardConsole.innerHTML = cardConsole.innerHTML + JSON.stringify(object).replaceAll('","', '", "').replaceAll('":"', '": "').replaceAll('":', '": ').replaceAll('<img', '') + ' ';
      cardConsole.innerHTML += '</p>';
    });
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

    cardDeck?.forEach(function(card, index) {

      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);

      if (!object.removed) {

        // move new cards into place
        window.setTimeout(function(cardRef) {
                  
          if (cardRef.style.top === '600px') {
            cardRef.style.top = '';
            Audio.sfx('deal-card');
          }
          cardRef.style.transform = '';

          if (!cardRef.classList.contains('fight')) {
            cardRef.style.left = cardLeftPosition + 'px';
            cardRef.style.zIndex = zIndexBase - index;  
          }

          if (cardDeck.length < 7 || index < 3) {
            cardLeftPosition += cardWidth;
          } else {
            cardLeftPosition += cardWidth / (index - 1.95);
          }

        }, 300 + 100 * index, cardRef);

        if (object.active) {
          if (object.locked) {
            cardRef.classList.add('locked');
          } else {
            cardRef.classList.remove('locked');
          }
          if (object.looted) {
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
          cardRef.querySelector('.distance').textContent = (object.distance > 1 ? Math.round(object.distance * 4.4) + ' min' : 'Here');
        }

        // deactivate cards
        if (!object.active) {
          window.setTimeout(function(cardId) {
            const object = Props.getObject(cardId);
            const cardRef = document.getElementById(cardId);

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

      if (object.removed) {
        if (cardRef) {
          cardRef.classList.add('remove');
          /*
          if (removeCard.classList.contains('zombie')) {
            Map.removeZedsAt(x, y);
          } else if (removeCard.classList.contains('event')) {
            // do nothing
          } else {
            Map.removeBuildingsAt(x, y);
          }*/
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

  updateCardMarkup: function(id) {

  },

  createCardMarkup: function(id) {
    let object = Props.getObject(id);

    let cardMarkupPre = '<div id="' + id + '" class="card ' + (object.locked ? 'locked ' : '') + ' ' + object.group + '" style="left: ' + Math.round(object.x * 44.4 - 120) + 'px; top: 600px; transform: scale(0.4);">' +
                          '<div class="inner">';

    let cardMarkupBuilding = '<div class="status"><div class="status-locked"></div><div class="status-zombies"></div><div class="status-looted"></div><div class="status-infested"></div></div>' +
                             '<h2>' + object.title + '</h2>' +
                             '<p class="activity glow is--hidden"></p>' +
                             '<img class="motive" src="./img/buildings/' + (object.name.startsWith('signpost-') ? 'signpost' : object.name) + '.png">' +
                             '<div class="banner"><img src="./img/icons/buildings/' + object.type + '.png"></div>';

    let cardMarkupZombie =   '<div class="attack">' + Math.floor(Math.random()*6+4) + '</div><div class="health">' + Math.floor(Math.random()*10+6) + '</div>' +
                             '<p class="activity glow is--hidden"></p>' +
                             '<img class="motive" src="./img/zombies/' + object.name + '.png">' +
                             '<div class="dead"><img src="./img/zombies/undead.png"></div>';

    let cardMarkupEvent =    '<h2>' + object.title + '</h2>' +
                             '<p class="text">' + object.text + '</p>';
                 
    let cardMarkupPost =  '</div>' +
                        '<span class="distance">' + (object.distance > 1 ? Math.round(object.distance * 4.4) + ' min' : 'Here') + '</span>' +
                      '</div>';

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

      let additionLockedInfo = '';
      if (action.locked && (action.id === 'cut-down' || action.id === 'break-door')) {
        additionLockedInfo = '<span class="additional-locked">Axe needed</span>';        
      }
      if (action.locked && action.id === 'smash-window') {
        additionLockedInfo = '<span class="additional-locked">Axe or Stone needed</span>';
      }
      if (action.locked && !object.inreach) {
        additionLockedInfo = '<span class="additional-locked">Too far away</span>';
      }
      if (action.locked && object.zednearby) {
        additionLockedInfo = '<span class="additional-locked">Zombies nearby</span>';
      }

      actionList += '<li class="' + action.id + (action.locked ? ' locked ' : '') + '"><div data-time="'+ action.time + '" data-energy="' + action.energy + '" data-action="' + action.id + '" class="action-button">' +
                    '<span class="text"><span class="material-symbols-outlined">lock</span> ' + action.label + '</span>' +
                    additionInfo + additionLockedInfo + '</div></li>';
    });

    // generate item markup
    let itemMarkup = '';
    for (var i = 0; i < object.items.length; i += 1) {
      itemMarkup += '<li class="preview"><span class="unknown">?</span><div class="searching is--hidden"><div></div><div></div></div></li>';
      if (object.items[i] && object.items[i].amount) {
        itemMarkup += '<li class="item is--hidden" data-item="'+object.items[i].name+'" data-amount="'+object.items[i].amount+'"><span class="img"><img src="./img/items/' + object.items[i].name + '.PNG"></span><span class="amount">' + (object.items[i].amount > 1 ? itemList[i].amount : '') + '</span><span class="grab">Grab</span></li>';
      }
    }

    // compile card markup

    let cardMarkup = cardMarkupPre;

    if (object.group === 'building') {
      cardMarkup += cardMarkupBuilding;
    } else if (object.group === 'zombie') {
      cardMarkup += cardMarkupZombie;
    } else if (object.group === 'event') {
      cardMarkup += cardMarkupEvent;
    }

    if (object.actions.length) {
      cardMarkup = cardMarkup + '<ul class="actions">' + actionList + '</ul>';
    }

    if (object.items.length) {
      cardMarkup = cardMarkup + '<ul class="items is--hidden">' + itemMarkup + '</ul>';
    }

    cardMarkup += cardMarkupPost;

    cardsContainer.innerHTML += cardMarkup;

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

  showActionFeedback: function(cardId, text, actionId) {

    const object = Props.getObject(cardId);
    const cardRef = this.getCardById(cardId);

    /* hide actions and show feedback */
    cardRef.querySelector('div.banner')?.classList.add('is--hidden');
    cardRef.querySelector('ul.actions')?.classList.add('is--hidden');
    cardRef.querySelector('p.activity').textContent = text;
    cardRef.querySelector('p.activity')?.classList.remove('is--hidden');

    /* optional: hide 1-time actions */
    if (actionId) {
      for (let i = object.actions.length - 1; i >= 0; i--) {
        if (object.actions[i].id === actionId) {
          // should be more decoupled
          cardRef.querySelector('li.' + actionId).remove();
          object.actions.splice(i, 1);
        }
      }
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

  /*
  removeCardFromDeck: function(removeCard, noUpdate) {
    const name = removeCard.dataset.name;
    const x = parseInt(removeCard.dataset.x); 
    const y = parseInt(removeCard.dataset.y);
    for (const [index, card] of cardDeck.entries()) {
      if (card.name === name && card.x === x && card.y === y) {
        cardDeck.splice(index, 1);
        removeCard.classList.add('remove');
        if (removeCard.classList.contains('zombie')) {
          Map.removeZedsAt(x, y);
        } else if (removeCard.classList.contains('event')) {
          // do nothing
        } else {
          Map.removeBuildingsAt(x, y);
        }
        window.setTimeout(function(removeCard) {
          removeCard.remove();
        }, 300, removeCard);
      }
    }
    if (!noUpdate) {
      this.renderCardDeck();
    }
  },

  getCardDeck: function() {
    return cardDeck;
  },*/

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
