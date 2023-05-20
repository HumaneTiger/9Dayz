import Audio from './audio.js'
import Props from './props.js'
import Player from './player.js'
import Map from './map.js'
import Items from './items.js'

const cardsContainer = document.getElementById('cards');
const cardWidth = 380 * 0.8;
const zIndexBase = 200;

var cardDeck = [], cardDeckIds = [];

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
        if (!object.discovered) {
          cardDeckIds.push(objectId);
        }
      });
    }
    this.renderCardDeck();
  },

  calculateCardDeckProperties: function() {

    const playerPosition = Player.getPlayerPosition();

    cardDeckIds?.forEach(id => {

      let object = Props.getObject(id);

      // distance
      object.distance = Math.sqrt( Math.pow((playerPosition.x - object.x), 2) + Math.pow((playerPosition.y - object.y), 2) );

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

      // removed
      // remove Cards with no actions and items left

    });

    // cardDeckIds.sort(this.compare);
    // add distance to make it possible
  },

  renderCardDeck: function() {
   
    this.calculateCardDeckProperties();

    cardDeckIds?.forEach(id => {  
      const object = Props.getObject(id);
      if (!object.discovered) {
        object.discovered = true;
        this.createCardMarkup(id);
      } else {
        this.updateCardMarkup(id);
      }
    });
    this.logDeck();
    this.refreshCardDeck();
  },

  logDeck: function() {
    const cardConsole = document.getElementById('card-console');
    cardConsole.innerHTML = '';
    cardDeckIds?.forEach(id => {  
      const object = Props.getObject(id);
      cardConsole.innerHTML = cardConsole.innerHTML + id + ': ';
      cardConsole.innerHTML = cardConsole.innerHTML + JSON.stringify(object).replaceAll('","', '", "').replaceAll('":"', '": "').replaceAll('":', '": ') + '<br>';
      cardConsole.innerHTML += '<br>';
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

    cardDeckIds?.forEach(function(cardId, index) {

      const object = Props.getObject(cardId);
      const cardRef = document.getElementById(cardId);

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

          if (cardDeckIds.length < 7 || index < 3) {
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
          // - when "no tools" (Cut down)
          /*
            if (!Items.inventoryContains('stone') && !Items.inventoryContains('axe') && !Items.inventoryContains('improvised-axe')) {
              smashAction?.classList.add('locked');
              smashAction ? smashAction.querySelector('.additional-locked').textContent = 'Axe/Stone needed' : false;
            } else {
              smashAction?.classList.remove('locked');
            }
            if (!Items.inventoryContains('axe') && !Items.inventoryContains('improvised-axe')) {
              breakAction?.classList.add('locked');
              breakAction ? breakAction.querySelector('.additional-locked').textContent = 'Axe needed' : false;
              cutDownAction?.classList.add('locked');
              cutDownAction ? cutDownAction.querySelector('.additional-locked').textContent = 'Axe needed' : false;
            } else {
              breakAction?.classList.remove('locked');
              cutDownAction?.classList.remove('locked');
            }
          */
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
                cardRef.remove();
              } else {
                cardRef.classList.add('is--hidden');
                cardRef.style.opacity = 1;
              }
            }, 300, cardRef, object);
          }, 300, cardId);  
        }
      }
    });
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
      let locked = '',
          additionLockedInfo = '';
      if (!object.inreach) {
        locked = ' locked';
        additionLockedInfo = '<span class="additional-locked">Too far away</span>';
      }
      if (object.zednearby) {
        locked = ' locked';
        additionLockedInfo = '<span class="additional-locked">Zombies nearby</span>';
      }

      actionList += '<li class="' + action.id + locked + '"><a data-time="'+ action.time + '" data-energy="' + action.energy + '" href="#' + action.id + '" class="action-button">' +
                    '<span class="text"><span class="material-symbols-outlined">lock</span> ' + action.label + '</span>' +
                    additionInfo + additionLockedInfo + '</a></li>';
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

  disableActions: function(disabled) {
    for (const [index, card] of cardDeck.entries()) {
      let cardRef = cardsContainer.querySelector('.' + (card.name + '-' + card.x + '-' + card.y));
      if (!disabled || cardRef.classList.contains('event')) {
        cardRef.classList.remove('actions-locked');
      } else {
        cardRef.classList.add('actions-locked');
      }
    }
  },

  removeCardFromDeckById: function(cardId) {
    this.removeCardFromDeck(this.getCardById(cardId));
  },

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
      this.updateCardDeck();
    }
  },

  getCardDeck: function() {
    return cardDeck;
  },

  compare: function( a, b ) {
    if ( a.dist < b.dist ){
      return -1;
    }
    if ( a.dist > b.dist ){
      return 1;
    }
    return 0;
  }

}
