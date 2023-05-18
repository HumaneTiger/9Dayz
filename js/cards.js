import Audio from './audio.js'
import Props from './props.js'
import Player from './player.js'
import Map from './map.js'
import Items from './items.js'

const allBuildings = Props.getAllBuildings();
const buildingProps = Props.getBuildingProps();
const allZeds = Props.getAllZeds();
let noZed = 1;

const cardsContainer = document.getElementById('cards');
const cardWidth = 380 * 0.8;
const zIndexBase = 200;

var cardDeck = [];
var cardId = 0;

const weaponProps = Props.getWeaponProps();

export default {
  
  init() {
  },

  getCardById: function(cardId) {
    return document.getElementById(cardId);
  },

  addCardsToDeck(x, y) {
    // rename: add new building cards to deck
    // use add singlecard to deck
    allBuildings[x][y]?.forEach(building => {  
      cardDeck.push({
          id: cardId,
          name: building,
          type: 'building',
          x: x,
          y: y
      });
      this.addCardMarkup(building, x, y);
    });
  },

  addSingleCardToDeck(x, y, type, name) {
    cardDeck.push({
      name: name,
      type: type,
      x: x,
      y: y
    });
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

  addZedsToDeck(x, y, amount) {
    if (allZeds[x][y] && amount >= 1) {
      for (var i = 0; i < amount; i += 1) {
        let name = 'zombie-' + noZed;
        noZed++;
        noZed > 3 ? noZed = 1 : false;
        Props.addZedAt(x, y, name);
        cardDeck.push({
          name: name,
          type: 'zombie',
          x: x,
          y: y
        });
        this.addZedCardMarkup(name, x, y);
        Audio.sfx('zed-appears');
      }
    }
  },

  addEventToDeck(x, y, event) {
    
    let cardMarkup = '<div id="card-' + cardId + '" class="card event ' + ('event-' + x + '-' + y) + '"' +
                        'data-name="event" data-x="' + x + '" data-y="' + y + '" ' +
                        'style="left: ' + Math.round(x * 44.4 - 120) + 'px; top: 600px; transform: scale(0.4);">' +
                        '<div class="inner"><h2>' + event.title + '</h2><p class="text">' + event.text + '</p>' +
                        '<ul class="actions"><li class="got-it"><a class="action-button" href="#got-it">Got it!</a></li></ul>' +
                        '</div><span class="distance">Here</span></div>';

    cardDeck.push({
      name: 'event',
      type: 'event',
      x: x,
      y: y
    });

    cardsContainer.innerHTML += cardMarkup;

    cardId += 1;
  },

  getCardDeck: function() {
    return cardDeck;
  },

  addZedCardMarkup: function(name, x, y) {

    let cardMarkupPre = '<div id="card-' + cardId + '" class="card zombie ' + (name + '-' + x + '-' + y) + '"' +
                        'data-name="' + name + '" data-x="' + x + '" data-y="' + y + '" ' +
                        'style="left: ' + Math.round(x * 44.4 - 120) + 'px; top: 600px; transform: scale(0.4);">' +
                        '<div class="inner"><div class="attack">'+Math.floor(Math.random()*6+4)+'</div><div class="health">'+Math.floor(Math.random()*10+6)+'</div>' +
                        '<p class="activity glow is--hidden"></p>' +
                        '<img class="motive" src="./img/zombies/' + name + '.png">' +
                        '<div class="dead"><img src="./img/zombies/undead.png"></div>';

    let cardMarkupPost = '</div><span class="distance">Here</span></div>';

    let cardMarkup = cardMarkupPre;

    cardMarkup += '<ul class="actions">' +
                  '<li class="lure"><a data-time="20" data-energy="-5" href="#lure" class="action-button"><span class="text">Lure</span><span class="additional">20 min - 60%</span></a></li><li class="attackz critical"><a data-energy="-15" href="#attack" class="action-button"><span class="text"><span class="material-symbols-outlined">release_alert</span> Attack</span><span class="additional">-15 <span class="material-symbols-outlined energy">flash_on</span></span></a></li>' +
                  '<li class="search is--hidden"><a href="#search" class="action-button"><span class="text">Search</span><span class="additional-locked"></span></a></li>' +
                  '</ul>';

    let loot = ['snack-1', 'snack-2', 'energy-pills', 'knife', 'tape', 'drink-2', 'drink-1', 'mallet', 'pincers', 'spanner', 'fail'];
    let itemList = [];
    let missingItem = Math.floor(Math.random() * 10) <= 5 ? 1 : 0;
    let itemMarkup = '';

    for (var i = 0; i < 3 - missingItem; i += 1) {
      itemList.push({
        name: loot[Math.floor(Math.random() * loot.length)],
        amount: 1
      });
    }

    for (var i = 0; i < 3; i += 1) {
      itemMarkup += '<li class="preview"><span class="unknown">?</span><div class="searching is--hidden"><div></div><div></div></div></li>';
      if (i < itemList.length) {
        itemMarkup += '<li class="item is--hidden" data-item="'+itemList[i].name+'" data-amount="'+itemList[i].amount+'"><span class="img"><img src="./img/items/' + itemList[i].name + '.PNG"></span><span class="amount">' + (itemList[i].amount > 1 ? itemList[i].amount : '') + '</span><span class="grab">Grab</span></li>';
      }
    }

    cardMarkup = cardMarkup + '<ul class="items is--hidden">' + itemMarkup + '</ul>';

    cardMarkup += cardMarkupPost;

    cardsContainer.innerHTML += cardMarkup;

    cardId += 1;

  },

  addCardMarkup: function(buildingName, x, y) {

    let props = buildingProps[buildingName];
    let type = Props.getBuildingTypeOf(buildingName);
    let actions = Props.getBuildingActionsFor(buildingName);

    let distance = 'Here';
    let locked = false;

    actions.forEach(action => {  
      if ((action.name === 'break door' || action.name === 'smash window') && Math.random() > 0.5) {
        locked = true;
      }
    });

    let cardMarkupPre = '<div id="card-' + cardId + '" class="card ' + (buildingName + '-' + x + '-' + y) + ' ' + (locked ? 'locked ' : '') + '" ' +
                            'data-name="' + buildingName + '" data-x="' + x + '" data-y="' + y + '" ' +
                            'style="left: ' + Math.round(x * 44.4 - 120) + 'px; top: 600px; transform: scale(0.4);">' +
                            '<div class="inner"><div class="status"><div class="status-locked"></div><div class="status-zombies"></div><div class="status-looted"></div><div class="status-infested"></div></div><h2>' + buildingName.replace('-1', '').replace('-2', '').replace('-', ' ') + '</h2>' +
                            '<p class="activity glow is--hidden"></p>' +
                            '<img class="motive" src="./img/buildings/' + (buildingName.startsWith('signpost-') ? 'signpost' : buildingName) + '.png">';
    let cardMarkupPost = '<div class="banner"><img src="./img/icons/buildings/' + type + '.png"></div></div><span class="distance">' + distance + '</span></div>';

    let cardMarkup = cardMarkupPre;
    let actionList = '';

    actions.forEach(action => {  
      let show = true;
      let energyAddon = '';
      if (!locked && (action.name === 'break door' || action.name === 'smash window')) {
        show = false;
      }
      if (action.energy) {
        energyAddon = ' | ' + action.energy + '<span class="material-symbols-outlined energy">flash_on</span>';
      }
      if (show) {
        actionList += '<li class="' + action.name.replace(' ', '-') + '"><a data-time="'+action.time+'" data-energy="'+action.energy+'" href="#' + action.name.replace(' ', '-') + '" class="action-button"><span class="text"><span class="material-symbols-outlined">lock</span> ' + action.name + '</span><span class="additional">' + action.time + ' min'+energyAddon+'</span><span class="additional-locked"></span></a></li>';
      }
    });

    cardMarkup = cardMarkup + '<ul class="actions">' + actionList + '</ul>';

    let itemList = [];
    let missingItem = Math.floor(Math.random() * 10) <= 4 ? 1 : 0;
    let itemMarkup = '';

    for (var i = 0; i < props.spawn - missingItem; i += 1) {
      itemList.push({
        name: props.items[Math.floor(Math.random() * props.items.length)],
        amount: 1
      });
    }

    for (var i = 0; i < 3; i += 1) {
      itemMarkup += '<li class="preview"><span class="unknown">?</span><div class="searching is--hidden"><div></div><div></div></div></li>';
      if (i < itemList.length) {
        itemMarkup += '<li class="item is--hidden" data-item="'+itemList[i].name+'" data-amount="'+itemList[i].amount+'"><span class="img"><img src="./img/items/' + itemList[i].name + '.PNG"></span><span class="amount">' + (itemList[i].amount > 1 ? itemList[i].amount : '') + '</span><span class="grab">Grab</span></li>';
      }
    }

    cardMarkup = cardMarkup + '<ul class="items is--hidden">' + itemMarkup + '</ul>';

    cardMarkup += cardMarkupPost;

    cardsContainer.innerHTML += cardMarkup;

    cardId += 1;

  },

  compare: function( a, b ) {
    if ( a.dist < b.dist ){
      return -1;
    }
    if ( a.dist > b.dist ){
      return 1;
    }
    return 0;
  },

  sortCardDeck: function(playerPosition) {
    for (var i = 0; i < cardDeck.length; i += 1) {
      cardDeck[i].dist = Math.sqrt( Math.pow((playerPosition.x - cardDeck[i].x), 2) + Math.pow((playerPosition.y - cardDeck[i].y), 2) );
    }
    cardDeck.sort(this.compare);
  },

  updateCardDeck() {

    var cardLeftPosition = 0;
    var cardIndex = 0;
    const playerPosition = Player.getPlayerPosition();
    let zedHere = false;
    const cardConsole = document.getElementById('card-console');

    // remove Cards with no actions left
    for (var i = cardDeck.length - 1; i >= 0; i -= 1) {
      let cardRef = cardsContainer.querySelector('.' + (cardDeck[i].name + '-' + cardDeck[i].x + '-' + cardDeck[i].y));
      if (cardRef.querySelector('ul.actions li') === null && cardRef.querySelector('ul.items li.item') === null) {
        cardRef.classList.add('remove');
        if (cardRef.classList.contains('zombie')) {
          Map.removeZedsAt(cardDeck[i].x, cardDeck[i].y);
        } else if (cardRef.classList.contains('event')) {
          // do nothing
        } else {
          Map.removeBuildingsAt(cardDeck[i].x, cardDeck[i].y);
        }
        cardDeck.splice(i, 1);
        window.setTimeout(function(removeCard) {
          removeCard.remove();
        }, 300, cardRef);
      }
    }

    this.sortCardDeck(playerPosition);

    cardConsole.innerHTML = '';
    for (var i = 0; i < cardDeck.length; i += 1) {
      let cardRef = cardsContainer.querySelector('.' + (cardDeck[i].name + '-' + cardDeck[i].x + '-' + cardDeck[i].y));
      let cardId = cardRef.id.split('-')[1];
      let objectId = Props.getObjectIdsAt(cardDeck[i].x, cardDeck[i].y);
      cardConsole.innerHTML = cardConsole.innerHTML + cardId + ': ' + cardDeck[i].name + ' (' + cardDeck[i].type + ', ' + cardDeck[i].x + ', ' + cardDeck[i].y + ')<br>';
      cardConsole.innerHTML = cardConsole.innerHTML + objectId + ': ';
      cardConsole.innerHTML = cardConsole.innerHTML + JSON.stringify(Props.getObject(objectId)).replaceAll('","', '", "').replaceAll('":"', '": "').replaceAll('":', '": ') + '<br><br>';
    }

    for (var i = cardDeck.length - 1; i >= 0; i -= 1) {
      if (cardDeck[i].type === 'zombie' && cardDeck[i].dist <= 1) {
        let cardRef = cardsContainer.querySelector('.' + (cardDeck[i].name + '-' + cardDeck[i].x + '-' + cardDeck[i].y));
        if (!cardRef.classList.contains('dead')) {
          zedHere = true;
        }
      }
    }

    for (var i = cardDeck.length - 1; i >= 0; i -= 1) {

      let cardRef = cardsContainer.querySelector('.' + (cardDeck[i].name + '-' + cardDeck[i].x + '-' + cardDeck[i].y));

      // Position (top / bottom)
      if (playerPosition.y < 15) {
        cardsContainer.classList.add('cards-at-bottom');
      } else {
        cardsContainer.classList.remove('cards-at-bottom');
      }

      // Prevent Search / Gather / Rest / Sleep / Cut Down
      let gatherAction = cardRef.querySelector('ul.actions li.gather');
      let searchAction = cardRef.querySelector('ul.actions li.search');
      let scoutAction = cardRef.querySelector('ul.actions li.scout-area');
      let restAction = cardRef.querySelector('ul.actions li.rest');
      let sleepAction = cardRef.querySelector('ul.actions li.sleep');
      let cutDownAction = cardRef.querySelector('ul.actions li.cut-down');
      let cookAction = cardRef.querySelector('ul.actions li.cook');
      let smashAction = cardRef.querySelector('ul.actions li.smash-window');
      let breakAction = cardRef.querySelector('ul.actions li.break-door');
      let drinkAction = cardRef.querySelector('ul.actions li.drink');
      let readAction = cardRef.querySelector('ul.actions li.read');

      // - when too far away (not "Here")
      // - when Zeds around
      if (zedHere) {
        cardRef.classList.add('zombieshere');
      } else {
        cardRef.classList.remove('zombieshere');
      }

      if (cardDeck[i].dist > 1.5 || zedHere) {
        let infoText = zedHere ? 'Zombies around' : 'Too far away';
        gatherAction?.classList.add('locked');
        gatherAction ? gatherAction.querySelector('.additional-locked').textContent = infoText : false;
        searchAction?.classList.add('locked');
        searchAction ? searchAction.querySelector('.additional-locked').textContent = infoText : false;
        scoutAction?.classList.add('locked');
        scoutAction ? scoutAction.querySelector('.additional-locked').textContent = infoText : false;
        restAction?.classList.add('locked');
        restAction ? restAction.querySelector('.additional-locked').textContent = infoText : false;
        sleepAction?.classList.add('locked');
        sleepAction ? sleepAction.querySelector('.additional-locked').textContent = infoText : false;
        cutDownAction?.classList.add('locked');
        cutDownAction ? cutDownAction.querySelector('.additional-locked').textContent = infoText : false;
        cookAction?.classList.add('locked');
        cookAction ? cookAction.querySelector('.additional-locked').textContent = infoText : false;
        drinkAction?.classList.add('locked');
        drinkAction ? drinkAction.querySelector('.additional-locked').textContent = infoText : false;
        readAction?.classList.add('locked');
        readAction ? readAction.querySelector('.additional-locked').textContent = infoText : false;
      } else {
        gatherAction?.classList.remove('locked');
        searchAction?.classList.remove('locked');
        scoutAction?.classList.remove('locked');
        restAction?.classList.remove('locked');
        sleepAction?.classList.remove('locked');
        cutDownAction?.classList.remove('locked');
        cookAction?.classList.remove('locked');
        drinkAction?.classList.remove('locked');
        readAction?.classList.remove('locked');
      }
      // - when "no tools" (Cut down)
      if (cardDeck[i].dist <= 1.5) {
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
      }
      
      // Remove Card
      if (cardDeck[i].dist > 4.5) {
        window.setTimeout(function(index, cardRef) {
          cardRef.style.left = Math.round(parseInt(cardRef.dataset.x) * 44.4 - 120) + 'px';
          cardRef.style.top = '600px';
          cardRef.style.transform = 'scale(0.4)';
          cardRef.style.opacity = 0;
          window.setTimeout(function(cardRef) {
            if (cardRef.classList.contains('event')) {
              cardRef.remove();
            } else {
              cardRef.classList.add('is--hidden');
              cardRef.style.opacity = 1;
            }
          }, 300, cardRef);
        }, 300, i, cardRef);
        cardDeck.splice(i, 1);
      }
    }

    for (var i = 0; i < cardDeck.length; i += 1) {

      window.setTimeout(function(i, cardDeck) {
        
        // when running too fast, Cards get removed from deck before the last Cards here are processed
        // doesn't seem to do any harm
        if (cardDeck[i] !== undefined) {
          
          let cardRef = cardsContainer.querySelector('.' + (cardDeck[i].name + '-' + cardDeck[i].x + '-' + cardDeck[i].y));

          if (cardRef) {

            let distance = 'Here';
            if (cardDeck[i].dist > 1) {
              distance = Math.round(cardDeck[i].dist * 4.4) + ' min';
            }
            cardRef.querySelector('.distance').textContent = distance;
            if (cardRef.style.top === '600px') {
              cardRef.style.top = '';
              Audio.sfx('deal-card');
            }
            cardRef.style.transform = '';

            if (!cardRef.classList.contains('fight')) {
              cardRef.style.left = cardLeftPosition + 'px';
              cardRef.style.zIndex = zIndexBase - cardIndex;  
            }

            cardIndex += 1;
            if (cardDeck.length < 7 || cardIndex < 3) {
              cardLeftPosition += cardWidth;
            } else {
              cardLeftPosition += cardWidth / (cardIndex - 1.95);
            }
          }
        }
      }, 300 + 100 * i, i, cardDeck);
    }
  },

  refreshBuildingsAt: function(x, y) {
    const buildings = Map.getBuildingsAt(x, y);
    if (buildings !== undefined) {
      for (var i = 0; i < buildings.length; i += 1) {
        let hiddenBuildingCard = cardsContainer.querySelector('.' + buildings[i] + '-' + x + '-' + y + '.is--hidden');
        if (hiddenBuildingCard) {
          hiddenBuildingCard.classList.remove('is--hidden');
          this.addSingleCardToDeck(x, y, 'buidling', buildings[i]);
          this.updateCardDeck();
        }
      }
      return true;
    }
    return false;
  },

  refreshZombiesAt: function(x, y) {
    const zombie = Props.getZedAt(x, y);
    if (zombie !== undefined) {
      let hiddenZombieCard = cardsContainer.querySelector('.' + zombie + '-' + x + '-' + y + '.is--hidden');
      if (hiddenZombieCard) {
        hiddenZombieCard.classList.remove('is--hidden');
        this.addSingleCardToDeck(x, y, 'zombie', zombie);
        this.updateCardDeck();
        return true;
      }
    }
    return false;
  },

  generateWeaponCardDeck() {
    
    var cardLeftPosition = 0;
    var distance;
    var cardIndex = 0;
    var cardDeckCount = weaponProps.length;

    for (const weaponName in weaponProps) {

      let props = weaponProps[weaponName];
      let type = Props.getBuildingTypeOf(weaponName);

      if (cardIndex < 3) {
        distance = 'Here'
      } else {
        distance = (cardIndex * 10 + Math.round(Math.random() * 10)) + ' min';
      } 
      let testCardMarkupPre = '<div class="card weapon" style="left: ' + cardLeftPosition + 'px; z-index: ' + (zIndexBase - cardIndex) + '"><div class="inner"><h2 style="margin-left: '+props[0]+'px">' + weaponName.replace('-1', '').replace('-2', '').replace('-', ' ') + '</h2><img class="motive" src="./img/weapons/' + weaponName + '.PNG">' +
                              '<span class="dmg chip"><span class="label">DMG</span>'+props[1]+'</span><ul class="extensions">';
      let testCardMarkupPost = '</ul></div><span class="distance">◈◈◈◈◈◈</span></div>';

      let testCardMarkup = testCardMarkupPre;
      let extensionList = '<li><span class="text damage">+2</span></li><li><span class="text durability">◈◈</span></li><li><span class="text add">+</span></li>';

      testCardMarkup += extensionList;

      testCardMarkup += testCardMarkupPost;

      cardsContainer.innerHTML += testCardMarkup;

      cardIndex += 1;

      cardLeftPosition += cardWidth;

    }

  }

}
