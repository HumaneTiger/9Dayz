import { default as Audio } from './audio.js'
import { default as Props } from './props.js'
import { default as Player } from './player.js'
import { default as Map } from './map.js'
import { default as Cooking } from './cooking.js'
import { default as Character } from './character.js'

const cardsContainer = document.getElementById('cards');
const cardWidth = 380 * 0.8;
const zIndexBase = 200;

export default {
  
  init: function() {
  },

  bind: function() {
  },

  createCardMarkup: function(id) {
    let object = Props.getObject(id);
    let cardMarkupExtension;

    let cardMarkupPre = '<div id="' + id + '" class="card ' + (object.locked ? 'locked ' : '') + (object.dead ? 'dead ' : '') + (object.preview ? 'preview ' : '') + ' ' + object.group + '" style="left: ' + Math.round(object.x * 44.4 - 120) + 'px; top: 600px; transform: scale(0.4);">' +
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
                             '<img class="motive" src="./img/animals/' + object.name + '.png">' +
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
      let label = action.label;

      if (action.time || action.energy) {
        additionInfo = '<span class="additional">';
        if (action.time) {
          additionInfo += action.time + ' min';
        }
        if (action.energy) {
          additionInfo += ' | ' + (action.energy > 0 ? '+' : '') + action.energy;
          if (action.id === 'rest') {
            additionInfo += '<span class="at-night">(+5)</span>';
          } else if (action.id === 'sleep') {
            additionInfo += '<span class="at-night">(+20)</span>';
          }
          additionInfo += '<span class="material-symbols-outlined energy">flash_on</span>';
        }
        additionInfo += '</span>';
      }
      if (action.id === 'rest' || action.id === 'sleep') {
        label = '<span class="material-symbols-outlined nightmode at-night">dark_mode</span> ' + label;
      }

      actionList += '<li class="' + action.id + '"><div data-action="' + action.id + '" class="action-button">' +
      '<span class="text">' + label + '</span>' +
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
    const props = Props.calcItemProps(name);
    return '<li class="preview"><span class="unknown">?</span><div class="searching is--hidden"><div></div><div></div></div></li>' +
           '<li class="item is--hidden" data-item="'+name+'" data-amount="'+amount+'">' +
           '<span class="img">' +
           (props?.type !== 'extra' ? '<img src="./img/items/'+name+'.PNG">' : '<img class="weapon" src="./img/weapons/'+name+'.png">') +
           '</span><span class="amount">' + (amount > 1 ? amount : '') + '</span><span class="grab">Grab</span></li>';
  },

  updateCardDeckMarkup: function(cardDeck) {
    const playerPosition = Player.getPlayerPosition();
    let cardLeftPosition = 0;
    let activeCardDeckSize = 0;
    let activeCardIndex = 0;

    // Position (top / bottom)
    if (playerPosition.y < 15) {
      cardsContainer.classList.add('cards-at-bottom');
      document.getElementById('character')?.classList.add('character-at-top');
    } else {
      cardsContainer.classList.remove('cards-at-bottom');
      document.getElementById('character')?.classList.remove('character-at-top');
    }

    cardDeck?.forEach((card) => {
      const object = Props.getObject(card.id);
      if (!object.removed && object.active) {
        activeCardDeckSize += 1;
      }
    });

    cardDeck?.forEach((card, index) => {

      const object = Props.getObject(card.id);
      const cardRef = document.getElementById(card.id);

      if (!object.removed) {
        if (object.active) {
          // move new cards into place
          window.setTimeout((cardRef) => {       
            activeCardIndex += 1;
            if (cardRef.style.top === '600px') {
              cardRef.style.top = '';
              Audio.sfx('deal-card');
            }
            if (!cardRef.classList.contains('fight')) {
              if (cardRef.style.left !== cardLeftPosition + 'px') {
                cardRef.style.transform = '';
                cardRef.style.left = cardLeftPosition + 'px';
                cardRef.style.zIndex = zIndexBase - activeCardIndex;
                delete cardRef.dataset.oldZindex;
              }
            }
            if (activeCardIndex < 13) {
              cardRef.classList.remove('out-of-queue');
              if (activeCardDeckSize < 7) {
                cardLeftPosition += Math.floor(cardWidth);
              } else if (activeCardDeckSize < 10) {
                if (activeCardIndex < 3) {
                  cardLeftPosition += Math.floor(cardWidth);
                } else {
                  cardLeftPosition += Math.floor(cardWidth - (activeCardIndex * 20));
                }
              } else {
                let additionalLeft = Math.floor(cardWidth - ((activeCardIndex + 1.5) * 20));
                if (additionalLeft < 100) { additionalLeft = 100 };
                cardLeftPosition += additionalLeft;
              }  
            } else if (!cardRef.classList.contains('fight')) {
              cardRef.classList.add('out-of-queue');
            }
          }, 300 + 100 * index, cardRef);

          if (object.locked) {
            cardRef.classList.add('locked');
          } else {
            cardRef.classList.remove('locked');
          }
          // need object prop for 'lootable', can also be used in props.js for action combos that make no sense
          if (object.looted && !(object.name.startsWith('signpost') || object.name === 'fireplace')) {
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

      object.actions?.forEach(action => {
        let actionRef = cardRef.querySelector('ul.actions li.' + action.id);
        if (action.locked) {
          if (!object.inreach) {
            actionRef.querySelector('.additional-locked').textContent = 'Too far away';
          } else if (action.energy && Player.getProp('energy') + action.energy < 0) {
            actionRef.querySelector('.additional-locked').textContent = Math.abs(action.energy) + ' energy needed';
          } else if (object.zednearby) {
            actionRef.querySelector('.additional-locked').textContent = 'Hostiles nearby';
          } else if (object.infested && (action.id === 'rest' || action.id === 'sleep')) {
            actionRef.querySelector('.additional-locked').textContent = 'Infested';
          } else if (action.id === 'cut-down' || action.id === 'break-door') {
            actionRef.querySelector('.additional-locked').textContent = 'Axe needed';        
          } else if (action.id === 'cut') {
            actionRef.querySelector('.additional-locked').textContent = 'Knife needed';        
          } else if (action.id === 'smash-window') {
            actionRef.querySelector('.additional-locked').textContent = 'Axe or Stone needed';
          } else if (action.id === 'equip') {
            if (Character.numberFilledSlots() >= 2) {
              actionRef.querySelector('.additional-locked').textContent = 'No free space';
            } else {
              actionRef.querySelector('.additional-locked').textContent = 'Can carry only one';
            }
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
          actionRef.querySelector('span.text').innerHTML = '<span class="material-symbols-outlined alert">release_alert</span> ' + action.label;
        } else {
          actionRef.classList.remove('critical');
          actionRef.querySelector('span.text').innerHTML = action.label;
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
  },

  showActionFeedback: function(cardRef, actionId) {
    let text = Props.mapActionsToText(actionId);
    if (cardRef) {
      /* hide actions and show feedback */
      cardRef.querySelector('div.banner')?.classList.add('is--hidden');
      cardRef.querySelector('ul.actions')?.classList.add('is--hidden');
      if (cardRef.querySelector('p.activity') !== null) {
        cardRef.querySelector('p.activity').textContent = text;
        cardRef.querySelector('p.activity')?.classList.remove('is--hidden');
        /* hide "dead" banner while activity is shown */
        cardRef.querySelector('div.dead')?.classList.add('is--hidden');
      }
    }
  },  
  
  hideActionFeedback: function(cardRef) {
    if (cardRef) {
      if (cardRef.querySelector('p.activity')) {
        cardRef.querySelector('p.activity').textContent = '';
        cardRef.querySelector('p.activity').classList.add('is--hidden');
        /* show "dead" banner when activity has finished */
        cardRef.querySelector('div.dead')?.classList.remove('is--hidden');
      }
      cardRef.querySelector('ul.actions')?.classList.remove('is--hidden');
      if (cardRef.querySelector('ul.items')?.classList.contains('is--hidden')) {
        cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
      }  
    }
  }

}