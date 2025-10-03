import Props from './props.js';
import Audio from './audio.js';
import Player from './player.js';
import Cards from './cards.js';
import CardsMarkup from './cards-markup.js';
import Map from './map.js';
import Items from './items.js';
import Battle from './battle.js';
import Cooking from './cooking.js';

export default {
  init: function () {},

  actionProps: {
    search: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateGathering(cardId, time, energy);
      },
      oneTime: true,
      delay: 0,
      label: 'searching',
    },
    cut: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateGathering(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'cutting',
    },
    gather: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateGathering(cardId, time, energy);
      },
      oneTime: true,
      delay: 0,
      label: 'gathering',
    },
    collect: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateCollecting(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'collecting',
    },
    'scout-area': {
      callback: (scope, cardId, time, energy) => {
        scope.simulateScouting(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'scouting',
    },
    rest: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateResting(cardId, time, energy);
      },
      oneTime: false,
      delay: 1000,
      label: 'resting',
    },
    sleep: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateSleeping(cardId, time, energy);
      },
      oneTime: false,
      delay: 1000,
      label: 'sleeping',
    },
    cook: {
      callback: (scope, cardId) => {
        scope.simulateCooking(cardId);
      },
      oneTime: false,
      delay: 1000,
      label: 'cooking',
    },
    equip: {
      callback: (scope, cardId) => {
        scope.simulateEquipping(cardId);
      },
      oneTime: true,
      delay: 1000,
      label: 'equipping',
    },
    'cut-down': {
      callback: (scope, cardId, time, energy) => {
        scope.simulateCuttingDown(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'cutting',
    },
    'smash-window': {
      callback: (scope, cardId, time, energy) => {
        scope.simulateSmashing(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'smashing',
    },
    'break-door': {
      callback: (scope, cardId, time, energy) => {
        scope.simulateBreaking(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'breaking',
    },
    'unlock-door': {
      callback: (scope, cardId, time, energy) => {
        scope.simulateOpening(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'opening',
    },
    'break-lock': {
      callback: (scope, cardId, time, energy) => {
        scope.simulateBreaking(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'breaking',
    },
    attack: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateAttacking(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: '',
    },
    lure: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateLuring(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'luring',
    },
    'got-it': {
      callback: (scope, cardId) => {
        scope.gotIt(cardId);
      },
      oneTime: true,
      delay: 0,
      label: '',
    },
    read: {
      callback: (scope, cardId, time, energy) => {
        scope.reading(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'reading',
    },
    drink: {
      callback: (scope, cardId, time, energy) => {
        scope.drinking(cardId, time, energy);
      },
      oneTime: false,
      delay: 1000,
      label: 'drinking',
    },
    fish: {
      callback: (scope, cardId, time, energy) => {
        scope.fishing(cardId, time, energy);
      },
      oneTime: false,
      delay: 1000,
      label: 'fishing',
    },
  },

  goToAndAction: function (cardId, action) {
    const object = Props.getObject(cardId);
    const actionObject = object.actions.find(singleAction => singleAction.id === action);
    const actionProps = this.actionProps[action];
    const cardRef = Cards.getCardById(cardId);

    if (actionObject && actionProps && cardRef) {
      if (actionObject.energy && Player.getProp('energy') + actionObject.energy < 0) {
        this.notEnoughEnergyFeedback();
      } else if (actionObject?.locked) {
        this.actionLockedFeedback(cardRef);
      } else {
        this.prepareAction(cardId, action);
        window.setTimeout(() => {
          actionProps.callback(this, cardId, actionObject.time, actionObject.energy);
        }, actionProps.delay || 0);
        if (action === 'unlock-door' || action === 'break-door' || action === 'smash-window') {
          // they all have the same effect
          // if one is done and removed, all others have to be removed as well
          this.removeOneTimeActions(cardId, 'unlock-door');
          this.removeOneTimeActions(cardId, 'break-door');
          this.removeOneTimeActions(cardId, 'smash-window');
        } else {
          this.removeOneTimeActions(cardId, action);
        }
      }
    } else {
      console.log('Invalid action or card reference!', action, cardId);
    }
  },

  prepareAction: function (cardId, action) {
    const object = Props.getObject(cardId);
    const actionProps = this.actionProps[action];
    Audio.sfx('click');
    Player.lockMovement(true);
    Cards.disableActions();
    CardsMarkup.showActionFeedback(cardId, actionProps.label);
    if (action !== 'lure') {
      Player.movePlayerTo(object.x, object.y);
    }
  },

  notEnoughEnergyFeedback: function () {
    const energyMeter = document.querySelector('#properties li.energy');
    energyMeter?.classList.add('heavy-shake');
    window.setTimeout(() => {
      energyMeter?.classList.remove('heavy-shake');
    }, 200);
    Audio.sfx('nope');
  },

  actionLockedFeedback: function (cardRef) {
    cardRef?.classList.add('card-shake');
    window.setTimeout(() => {
      cardRef?.classList.remove('card-shake');
    }, 200);
    Audio.sfx('nope');
  },

  removeOneTimeActions: function (cardId, action) {
    const object = Props.getObject(cardId);
    const actionProps = this.actionProps[action];
    const cardRef = Cards.getCardById(cardId);
    if (actionProps.oneTime) {
      for (let i = object.actions.length - 1; i >= 0; i--) {
        if (object.actions[i].id === action) {
          if (!(object.infested && (action === 'search' || action === 'gather'))) {
            cardRef.querySelector('li.' + action).remove();
            object.actions.splice(i, 1);
          }
        }
      }
    }
  },

  goBackFromAction: function (cardId) {
    this.endAction(cardId);
    Player.updatePlayer(true);
    window.setTimeout(() => {
      Player.lockMovement(false);
    }, 1000);
  },

  endAction: function (cardId) {
    let cardRef = Cards.getCardById(cardId);
    CardsMarkup.hideActionFeedback(cardRef);
  },

  fastForward: function (callbackfunction, cardId, time, newSpeedOpt, energy) {
    const defaultSpeed = Props.getGameProp('speed');
    const newSpeed = newSpeedOpt || 400;
    if (time) {
      let ticks = parseInt(time) / 10;
      Props.setGameProp('speed', newSpeed);
      window.setTimeout(
        (defaultSpeed, cardId) => {
          Props.setGameProp('speed', defaultSpeed);
          callbackfunction.call(this, cardId, energy);
        },
        ticks * newSpeed,
        defaultSpeed,
        cardId
      );
    }
  },

  grabItem: function (cardId, container, itemName) {
    const object = Props.getObject(cardId);
    const itemAmount = object.items.find(singleItem => singleItem.name === itemName)?.amount;
    const itemProps = Props.getItem(itemName);
    let cardRef = Cards.getCardById(cardId);
    if (itemProps && itemProps[0] === 'extra') {
      // spawn weapon as card
      Props.setupWeapon(Player.getPlayerPosition().x, Player.getPlayerPosition().y, itemName);
    } else if (itemName === 'crate') {
      Props.setupBuilding(Player.getPlayerPosition().x, Player.getPlayerPosition().y, [itemName]);
    } else {
      Props.addItemToInventory(itemName, itemAmount);
    }
    object.items.find(singleItem => singleItem.name === itemName).amount = 0;
    container.classList.add('transfer');
    Items.inventoryChangeFeedback();
    Items.fillInventorySlots();
    Audio.sfx('pick', 0, 0.1);
    window.setTimeout(
      container => {
        if (cardRef) {
          container.classList.add('is--hidden');
          if (itemName === 'crate' || itemProps[0] === 'extra') {
            Player.findAndHandleObjects();
          } // this LOC must be placed here, otherwise the "grab slot" for weapons isn't removed correctly
          if (
            object.items.filter(singleItem => singleItem.amount > 0).length === 0 &&
            !cardRef.querySelectorAll('ul.items li.preview:not(.is--hidden)')?.length
          ) {
            Cards.renderCardDeck();
          }
        }
      },
      400,
      container
    );
  },

  simulateGathering: function (cardId, time, energy) {
    const object = Props.getObject(cardId);
    const cardRef = Cards.getCardById(cardId);
    const allItems = object.items;
    // first car/house/train always has a tape
    if (
      !Props.getGameProp('firstSearch') &&
      (object.type === 'car' || object.type === 'house' || object.type === 'train') &&
      cardRef.querySelector('ul.items')
    ) {
      Props.setGameProp('firstSearch', true);
      // replace first item in data and markup
      // but only if the item isn't already there
      if (!allItems.some(el => el.name === 'tape' && el.amount > 0)) {
        allItems[0] = { name: 'tape', amount: 1 };
        cardRef.querySelector('ul.items li.preview').remove();
        cardRef.querySelector('ul.items li.item').remove();
        cardRef.querySelector('ul.items').innerHTML =
          CardsMarkup.generateItemMarkup('tape', 1) + cardRef.querySelector('ul.items').innerHTML;
      }
    }
    let allPreviews = cardRef.querySelectorAll('ul.items li.preview');

    let timeout = 2000;
    let delay = 2000;

    if (object.infested) {
      let hostileObjectIds;
      if (object.name === 'beehive') {
        hostileObjectIds = Props.spawnBeesAt(object.x, object.y);
      } else {
        hostileObjectIds = Props.spawnRatsAt(object.x, object.y);
      }
      cardRef.classList.remove('infested');
      object.actions?.forEach(action => {
        // search/gather action not critical any more
        if (action.name === 'search' || action.name === 'gather') {
          action.critical = false;
        }
      });
      Player.handleFoundObjectIds(hostileObjectIds);
      window.setTimeout(() => {
        object.infested = false;
        this.endAction(cardId);
        Battle.startBattle(true); // instant attack when place is infested
      }, 1200);
    } else if (allPreviews) {
      cardRef.querySelector('ul.items')?.classList.remove('is--hidden');
      allPreviews[0].querySelector('.unknown').classList.add('is--hidden');
      allPreviews[0].querySelector('.searching').classList.remove('is--hidden');
      if (object.type === 'house' && Math.random() < 0.25) {
        Props.setupBuilding(object.x, object.y, ['human-corpse-1']);
      }
      if ((object.name === 'house' || object.name === 'farm-house') && Math.random() < 0.2) {
        Props.setupBuilding(object.x, object.y, ['basement'], false, true);
      }
      if (object.name === 'old-villa') {
        Props.setupBuilding(object.x, object.y, ['basement'], ['crate'], true);
      }
      for (let i = 0; i < allItems.length; i += 1) {
        window.setTimeout(
          (index, item, cardId, energy) => {
            allPreviews[index].classList.add('is--hidden');
            if (item.amount > 0) {
              if (item.name === 'duck' || item.name === 'froggy') {
                Props.spawnAnimalAt(item.name, object.x, object.y);
                cardRef.querySelector(
                  'ul.items li[data-item="' + item.name + '"].is--hidden'
                ).dataset.amount = 0;
                item.amount = 0;
              } else {
                cardRef
                  .querySelector('ul.items li[data-item="' + item.name + '"].is--hidden')
                  .classList.remove('is--hidden');
              }
            }
            if (index + 1 < allItems.length) {
              allPreviews[index + 1].querySelector('.unknown').classList.add('is--hidden');
              allPreviews[index + 1].querySelector('.searching').classList.remove('is--hidden');
            }
            if (index + 1 === allItems.length) {
              this.goBackFromAction(cardId);
              Player.changeProps('energy', energy);
              if (
                !allItems.some(function (item) {
                  return item.amount > 0;
                })
              ) {
                cardRef.querySelector('ul.items').remove();
                cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
                cardRef.classList.add('looted');
                // check if card can be removed (no actions left)
                Cards.renderCardDeck();
              }
            }
          },
          i * timeout + delay,
          i,
          allItems[i],
          cardId,
          energy
        );
      }
    }
  },

  simulateScouting: function (cardId, time, energy) {
    Map.showScoutMarkerFor(cardId);

    this.fastForward(
      function (cardId, energy) {
        const object = Props.getObject(cardId);
        /* if (object.x % 4 === 0 || object.y % 4 === 0) { Map.mapUncoverAt(x, y); } */
        this.goBackFromAction(cardId);
        const allFoundObjectIds = Player.findObjects(object.x, object.y);
        Player.handleFoundObjectIds(allFoundObjectIds);
        this.searchForKey(object);
        Map.hideScoutMarker();
        Player.changeProps('energy', energy);
        this.checkForInfested(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  searchForKey: function (object) {
    if (object.locked) {
      const randomFound = Math.random();
      if (randomFound > 0) {
        Props.setupBuilding(Player.getPlayerPosition().x, Player.getPlayerPosition().y, ['key']);
      }
    }
  },

  simulateResting: function (cardId, time, energy) {
    Map.showScoutMarkerFor(cardId);
    if (Props.getGameProp('timeMode') === 'night') {
      energy += 5;
    }
    this.fastForward(
      function (cardId, energy) {
        Player.changeProps('energy', energy);
        Player.changeProps('health', Math.floor(energy / 2));
        Player.changeProps('food', -10);
        Player.changeProps('thirst', -14);
        Map.hideScoutMarker();
        this.goBackFromAction(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateSleeping: function (cardId, time, energy) {
    Map.showScoutMarkerFor(cardId);
    if (Props.getGameProp('timeMode') === 'night') {
      energy += 20;
    }
    this.fastForward(
      function (cardId, energy) {
        Player.changeProps('energy', energy);
        Player.changeProps('health', Math.floor(energy / 2));
        Player.changeProps('food', -18);
        Player.changeProps('thirst', -24);
        Map.hideScoutMarker();
        this.goBackFromAction(cardId);
      },
      cardId,
      time,
      100,
      energy
    );
  },

  simulateCooking: function (cardId) {
    const cardRef = Cards.getCardById(cardId);
    window.setTimeout(() => {
      Cooking.start(cardRef);
      this.goBackFromAction(cardId);
    }, 800);
  },

  simulateCollecting: function (cardId, energy) {
    const object = Props.getObject(cardId);
    Props.addItemToInventory(object.name, 1);
    object.removed = true;
    window.setTimeout(
      (cardId, energy) => {
        Items.fillInventorySlots();
        Items.checkCraftingPrerequisits();
        Player.changeProps('energy', energy);
        this.goBackFromAction(cardId);
      },
      800,
      cardId,
      energy
    );
  },

  simulateEquipping: function (cardId) {
    const object = Props.getObject(cardId);
    if (object.group === 'weapon' && object.name) {
      Props.addWeaponToInventory(object.name, 1, {
        durability: object.durability,
        damage: object.attack,
        protection: object.defense,
      });
    }
    window.setTimeout(
      cardId => {
        Items.fillInventorySlots();
        Items.checkCraftingPrerequisits();
        this.goBackFromAction(cardId);
      },
      800,
      cardId
    );
  },

  simulateCuttingDown: function (cardId, time, energy) {
    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    const object = Props.getObject(cardId);
    object.removed = true;

    this.fastForward(
      function (cardId, energy) {
        this.goBackFromAction(cardId);
        if (Items.inventoryContains('improvised-axe')) {
          Props.addWeaponToInventory('improvised-axe', 0, { durability: -1 });
        } else if (Items.inventoryContains('axe')) {
          Props.addWeaponToInventory('axe', 0, { durability: -1 });
        }
        Props.addItemToInventory('stump', 1);
        Props.addItemToInventory('branch', 2 + Math.round(Math.random() - 0.25));
        Props.addItemToInventory('straw-wheet', Math.round(Math.random() - 0.25));
        Items.inventoryChangeFeedback();
        Items.fillInventorySlots();
        Player.changeProps('energy', energy);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateLuring: function (cardId, time, energy) {
    Player.lockMovement(true);
    Cards.disableActions();

    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(Player.getPlayerPosition().x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(Player.getPlayerPosition().y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(
      function (cardId, energy) {
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
      },
      cardId,
      time,
      1600,
      energy
    );
  },

  simulateAttacking: function (cardId) {
    const object = Props.getObject(cardId);
    const allFoundObjectIds = Player.findObjects(object.x, object.y);

    const zedsOnly = allFoundObjectIds.filter(
      singleObject => Props.getObject(singleObject).group === 'zombie'
    );
    Cards.showAllZedsNearby();
    Player.handleFoundObjectIds(zedsOnly);
    Cards.disableActions();

    window.setTimeout(() => {
      this.endAction(cardId);
      Battle.startBattle();
    }, 800);
  },

  gotIt: function (cardId) {
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

  simulateBreaking: function (cardId, time, energy) {
    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);

    this.fastForward(
      function (cardId, energy) {
        const object = Props.getObject(cardId);
        object.locked = false;
        if (Items.inventoryContains('improvised-axe')) {
          Props.addWeaponToInventory('improvised-axe', 0, { durability: -1 });
        } else if (Items.inventoryContains('axe')) {
          Props.addWeaponToInventory('axe', 0, { durability: -1 });
        }
        Items.fillInventorySlots();
        Items.checkCraftingPrerequisits();
        Player.changeProps('energy', energy);
        this.goBackFromAction(cardId);
        this.checkForInfested(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateOpening: function (cardId, time, energy) {
    Audio.sfx('unlock', 0, 0.6);

    this.fastForward(
      function (cardId, energy) {
        const object = Props.getObject(cardId);
        object.locked = false;
        if (Items.inventoryContains('key')) {
          Props.addItemToInventory('key', -1);
        }
        Items.fillInventorySlots();
        Items.checkCraftingPrerequisits();
        Player.changeProps('energy', energy);
        this.goBackFromAction(cardId);
        this.checkForInfested(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  checkForInfested: function (cardId) {
    const cardRef = Cards.getCardById(cardId);
    const object = Props.getObject(cardId);
    if (object.infested && object.name !== 'beehive' && !object.locked) {
      const ratObjectIds = Props.spawnRatsAt(object.x, object.y);
      console.log(ratObjectIds);
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

  simulateSmashing: function (cardId, time, energy) {
    Audio.sfx('break-glass', 350);

    this.fastForward(
      function (cardId, energy) {
        const object = Props.getObject(cardId);
        object.locked = false;
        Player.changeProps('energy', energy);
        this.goBackFromAction(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  drinking: function (cardId, time) {
    Audio.sfx('water');
    this.fastForward(
      function (cardId) {
        Player.changeProps('thirst', 50);
        this.goBackFromAction(cardId);
      },
      cardId,
      time,
      800
    );
  },

  fishing: function (cardId, time, energy) {
    Audio.sfx('water-dip');
    Map.showScoutMarkerFor(cardId);
    this.fastForward(
      function (cardId) {
        Map.hideScoutMarker();
        Player.changeProps('energy', energy);
        Player.changeProps('food', -5);
        Player.changeProps('thirst', -10);
        // always success for now, add minigame later
        // baits would be nice as well
        // eslint-disable-next-line no-constant-condition
        if (true) {
          const object = Props.getObject(cardId);
          Props.spawnAnimalAt('fish', object.x, object.y);
          Props.addWeaponToInventory('fishing-rod', 0, { durability: -1 });
          Items.fillInventorySlots();
          Items.checkCraftingPrerequisits();
        }
        this.goBackFromAction(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  reading: function (cardId) {
    window.setTimeout(
      cardId => {
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
        if (Props.getGameProp('tutorial') === false) {
          Props.saveCheckpoint(targetLocationName, Player.getPlayerPosition(), {
            health: Player.getProp('health'),
            food: Player.getProp('food'),
            thirst: Player.getProp('thirst'),
            energy: Player.getProp('energy'),
          });
        }
        this.goBackFromAction(cardId);
      },
      1800,
      cardId
    );
  },
};
