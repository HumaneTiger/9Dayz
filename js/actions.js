import Props from './props.js';
import Audio from './audio.js';
import Player from './player.js';
import Cards from './cards.js';
import CardsMarkup from './cards-markup.js';
import Map from './map.js';
import Items from './items.js';
import Battle from './battle.js';
import Cooking from './cooking.js';
import Character from './character.js';
import Checkpoint from './checkpoint.js';
import RngUtils from './utils/rng-utils.js';

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
    pet: {
      callback: (scope, cardId, time, energy) => {
        scope.simulatePetting(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'petting',
    },
    scare: {
      callback: (scope, cardId, time, energy) => {
        scope.simulateScaring(cardId, time, energy);
      },
      oneTime: true,
      delay: 1000,
      label: 'scaring',
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
      delay: 500,
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
    chomp: {
      callback: (scope, cardId, time, energy) => {
        scope.chomping(cardId, time, energy);
      },
      oneTime: true,
      delay: 0,
      label: 'Dog attacks',
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
    const timeConfig = Props.getGameProp('timeConfig');
    const defaultThreshold = timeConfig.gameTickThreshold;
    const newThreshold = newSpeedOpt || 400;
    if (time) {
      let ticks = parseInt(time) / 10;
      timeConfig.gameTickThreshold = newThreshold;
      Props.setGameProp('timeConfig', timeConfig);
      window.setTimeout(
        (defaultThreshold, cardId) => {
          const timeConfig = Props.getGameProp('timeConfig');
          timeConfig.gameTickThreshold = defaultThreshold;
          Props.setGameProp('timeConfig', timeConfig);
          callbackfunction.call(this, cardId, energy);
        },
        ticks * newThreshold,
        defaultThreshold,
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
      // spawn card representing the grabbed weapon item
      Props.setupWeapon(Player.getPlayerPosition().x, Player.getPlayerPosition().y, itemName);
    } else if (itemName === 'crate') {
      // spawn card representing the grabbed crate item
      Props.setupBuilding(
        Player.getPlayerPosition().x,
        Player.getPlayerPosition().y,
        new Array('crate')
      );
    } else {
      Props.addItemToInventory(itemName, itemAmount);
    }
    object.items.find(singleItem => singleItem.name === itemName).amount = 0;
    container.classList.add('transfer');
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

  addGuarenteedTapeToFirstSearch: function (object, cardRef, allItems) {
    // adding a guaranteed tape to first searched car/house/train
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
  },

  simulateGathering: function (cardId, time, energy) {
    const object = Props.getObject(cardId);
    const cardRef = Cards.getCardById(cardId);
    const allItems = object.items;

    this.addGuarenteedTapeToFirstSearch(object, cardRef, allItems);

    let allPreviews = cardRef.querySelectorAll('ul.items li.preview');

    let timeout = 2000;
    let delay = 2000;

    if (object.infested) {
      this.spawnCreaturesIfInfested(cardId);
      window.setTimeout(() => {
        this.endAction(cardId);
        Battle.startBattle(true); // instant attack when place is infested
      }, 1200);
    } else if (allPreviews) {
      /** it's a strange condition, but I think this is what it does:
       * it wants to make sure that the gathering action was never used before
       * only in that case, there are more random other buildings spawning (like basements, corpses)
       * it prevents these buildings from spawning again when e.g. the card is revealed a second time
       */
      cardRef.querySelector('ul.items')?.classList.remove('is--hidden');
      allPreviews[0].querySelector('.unknown').classList.add('is--hidden');
      allPreviews[0].querySelector('.searching').classList.remove('is--hidden');
      /* houses and villas will randomly spawn corpses or basements when searched */
      if (object.additionalGameObjects && object.additionalGameObjects.length > 0) {
        object.additionalGameObjects.forEach(addGameObject => {
          if (addGameObject.group === 'building') {
            Props.setupBuilding(
              addGameObject.x,
              addGameObject.y,
              new Array(addGameObject.name),
              addGameObject.forceInfested,
              addGameObject.forceLootItemList,
              addGameObject.forceCreaturesList,
              addGameObject.forceAdditionalGameObjects
            );
          } else if (addGameObject.group === 'animal') {
            Props.spawnAnimal(addGameObject);
          }
        });
      }
      for (let i = 0; i < allItems.length; i += 1) {
        window.setTimeout(
          (index, item, cardId, energy) => {
            allPreviews[index].classList.add('is--hidden');
            if (item.amount > 0) {
              cardRef
                .querySelector('ul.items li[data-item="' + item.name + '"].is--hidden')
                .classList.remove('is--hidden');
            }
            if (index + 1 < allItems.length) {
              allPreviews[index + 1].querySelector('.unknown').classList.add('is--hidden');
              allPreviews[index + 1].querySelector('.searching').classList.remove('is--hidden');
            }
            if (index + 1 === allItems.length) {
              this.goBackFromAction(cardId);
              Props.changePlayerProp('energy', energy);
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

  simulatePetting: function (cardId, time, energy) {
    this.fastForward(
      function (cardId, energy) {
        const object = Props.getObject(cardId);
        object.removed = true;
        Props.addCompanion(cardId);
        Character.updateCompanionSlot();
        this.goBackFromAction(cardId);
        Props.changePlayerProp('energy', energy);
      },
      cardId,
      time,
      2000,
      energy
    );
  },

  simulateScaring: function (cardId, time, energy) {
    const object = Props.getObject(cardId);
    object.removed = true;
    this.fastForward(
      function (cardId, energy) {
        this.goBackFromAction(cardId);
        Props.changePlayerProp('energy', energy);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateScouting: function (cardId, time, energy) {
    Map.showScoutMarkerFor(cardId);

    this.fastForward(
      function (cardId, energy) {
        const object = Props.getObject(cardId);
        this.searchForKey(object);
        /* if (object.x % 4 === 0 || object.y % 4 === 0) { Map.mapUncoverAt(x, y); } */
        this.goBackFromAction(cardId);
        const allFoundObjectIds = Player.findObjects(object.x, object.y);
        Player.handleFoundObjectIds(allFoundObjectIds);
        Map.hideScoutMarker();
        Props.changePlayerProp('energy', energy);
        this.spawnCreaturesIfInfested(cardId, true);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  searchForKey: function (object) {
    if (object.locked && object.hasKey) {
      object.hasKey = false;
      Props.setupBuilding(
        Player.getPlayerPosition().x,
        Player.getPlayerPosition().y,
        new Array('key')
      );
    }
  },

  simulateResting: function (cardId, time, energy) {
    Map.showScoutMarkerFor(cardId);
    if (Props.getGameProp('timeMode') === 'night') {
      energy += 5;
    }
    this.fastForward(
      function (cardId, energy) {
        Props.changePlayerProp('energy', energy);
        Props.changePlayerProp('health', Math.floor(energy / 2));
        Props.changePlayerProp('food', -10);
        Props.changePlayerProp('thirst', -14);
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
        Props.changePlayerProp('energy', energy);
        Props.changePlayerProp('health', Math.floor(energy / 2));
        Props.changePlayerProp('food', -18);
        Props.changePlayerProp('thirst', -24);
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
    object.removed = true;
    window.setTimeout(
      (cardId, energy) => {
        Props.addItemToInventory(object.name, 1);
        Props.changePlayerProp('energy', energy);
        this.goBackFromAction(cardId);
      },
      1200,
      cardId,
      energy
    );
  },

  simulateEquipping: function (cardId) {
    window.setTimeout(
      cardId => {
        const object = Props.getObject(cardId);
        if (object.group === 'weapon' && object.name) {
          Props.addWeaponToInventory(object.name, 1, {
            durability: object.durability,
            damage: object.attack,
            protection: object.defense,
          });
        }
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
        Props.beginInventoryBatch();
        Props.addItemToInventory('stump', 1);
        Props.addItemToInventory('branch', 2 + Math.round(RngUtils.cuttingTreeRNG.random() - 0.25));
        Props.addItemToInventory(
          'straw-wheet',
          Math.round(RngUtils.cuttingTreeRNG.random() - 0.25)
        );
        Props.changePlayerProp('energy', energy);
        Props.endInventoryBatch();
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
        const object = Props.getObject(cardId);
        this.endAction(cardId);

        Map.hideScoutMarker();

        if (object.luringSuccessful) {
          Battle.startBattle(false, cardId);
        } else {
          const cardRef = Cards.getCardById(cardId);
          Cards.enableActions();
          Player.lockMovement(false);
          Props.changePlayerProp('energy', energy);
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
        Props.changePlayerProp('energy', energy);
        this.goBackFromAction(cardId);
        this.spawnCreaturesIfInfested(cardId);
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
        Props.changePlayerProp('energy', energy);
        this.goBackFromAction(cardId);
        this.spawnCreaturesIfInfested(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  spawnCreaturesIfInfested: function (cardId, onlyRats = false) {
    /* when scouting/breaking/opening an infested building, spawn creatures (they do not attack) */
    const cardRef = Cards.getCardById(cardId);
    const object = Props.getObject(cardId);
    if (object.infested && !object.locked) {
      if (!onlyRats || object.name !== 'beehive') {
        let hostileObjectIds = Props.spawnCreaturesAt(object.x, object.y, object.enemies);
        // building not infested anymore
        cardRef.classList.remove('infested');
        object.infested = false;
        // search action not critical any more
        const action = object.actions?.find(a => a.name === 'search' || a.name === 'gather');
        if (action) action.critical = false;
        // update card deck with new creature cards
        Player.handleFoundObjectIds(hostileObjectIds);
      }
    }
  },

  simulateSmashing: function (cardId, time, energy) {
    Audio.sfx('break-glass', 350);

    this.fastForward(
      function (cardId, energy) {
        const object = Props.getObject(cardId);
        object.locked = false;
        Props.changePlayerProp('energy', energy);
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
        Props.changePlayerProp('thirst', 50);
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
        Props.changePlayerProp('energy', energy);
        Props.changePlayerProp('food', -5);
        Props.changePlayerProp('thirst', -10);
        // baits would be nice as well
        const object = Props.getObject(cardId);
        const success = Props.rngFishSpawn(object.x, object.y);
        if (success) {
          Audio.sfx('fish-catch');
          Props.addWeaponToInventory('fishing-rod', 0, { durability: -1 });
        }
        this.goBackFromAction(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  chomping: function (cardId, time, energy) {
    Player.lockMovement(true);
    Cards.disableActions();
    Audio.sfx('bark');

    const scoutMarker = document.getElementById('scoutmarker');
    scoutMarker.style.left = Math.round(Player.getPlayerPosition().x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(Player.getPlayerPosition().y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    this.fastForward(
      function (cardId) {
        this.endAction(cardId);
        Map.hideScoutMarker();
        Battle.startCompanionBattle(cardId);
      },
      cardId,
      time,
      400,
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
          Checkpoint.save(targetLocationName);
        }
        this.goBackFromAction(cardId);
      },
      1800,
      cardId
    );
  },
};
