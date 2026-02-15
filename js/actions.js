import Props from './props.js';
import Audio from './audio.js';
import Player from './player.js';
import Cards from './cards.js';
import Map from './map.js';
import Items from './items.js';
import Battle from './battle.js';
import Cooking from './cooking.js';
import Character from './character.js';
import Checkpoint from './checkpoint.js';
import Almanac from './almanac.js';
import RngUtils from './utils/rng-utils.js';
import ActionsUtils from './utils/actions-utils.js';
import TimingUtils from './utils/timing-utils.js';

export default {
  init: function () {},

  simulateGathering: async function (actionsOrchestration, cardId, time, energy) {
    const object = Props.getObject(cardId);
    const cardRef = Cards.getCardById(cardId);
    const allItems = object.items;

    ActionsUtils.addGuarenteedTapeToFirstSearch(object, cardRef, allItems);

    let allPreviews = cardRef.querySelectorAll('ul.items li.preview');

    let timeout = 2000;
    let delay = 2000;

    if (object.infested) {
      ActionsUtils.spawnCreaturesIfInfested(cardId);
      await TimingUtils.wait(1200);
      actionsOrchestration.endAction(cardId);
      Battle.startBattle(true); // instant attack when place is infested
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
      await TimingUtils.wait(delay);
      for (let i = 0; i < allItems.length; i += 1) {
        const item = allItems[i];
        allPreviews[i].classList.add('is--hidden');
        if (item.amount > 0) {
          cardRef
            .querySelector('ul.items li[data-item="' + item.name + '"].is--hidden')
            .classList.remove('is--hidden');
        }
        if (i + 1 < allItems.length) {
          allPreviews[i + 1].querySelector('.unknown').classList.add('is--hidden');
          allPreviews[i + 1].querySelector('.searching').classList.remove('is--hidden');
        }
        if (i + 1 === allItems.length) {
          actionsOrchestration.goBackFromAction(cardId);
          Props.changePlayerProp('energy', energy);
          // furbuddy takes damage when cutting animals
          if (Props.getGameProp('character') === 'furbuddy' && object.group === 'animal') {
            Props.changePlayerProp('health', -10);
          }
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
        await TimingUtils.wait(timeout);
      }
    }
  },

  simulatePetting: function (actionsOrchestration, cardId, time, energy) {
    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        const object = Props.getObject(cardId);
        object.removed = true;
        const { attack, defense, ...rest } = object;
        Props.addCompanion({
          ...rest,
          damage: attack,
          protection: defense,
        });
        Character.updateCompanionSlot();
        Almanac.makeContentKnown(object.name);
        actionsOrchestration.goBackFromAction(cardId);
        Props.changePlayerProp('energy', energy);
      },
      cardId,
      time,
      2000,
      energy
    );
  },

  simulateScaring: function (actionsOrchestration, cardId, time, energy) {
    const object = Props.getObject(cardId);
    object.removed = true;
    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        actionsOrchestration.goBackFromAction(cardId);
        Props.changePlayerProp('energy', energy);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateScouting: function (actionsOrchestration, cardId, time, energy) {
    Map.showScoutMarkerFor(cardId);

    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        const object = Props.getObject(cardId);
        ActionsUtils.searchForKey(object);
        /* if (object.x % 4 === 0 || object.y % 4 === 0) { Map.mapUncoverAt(x, y); } */
        actionsOrchestration.goBackFromAction(cardId);
        const allFoundObjectIds = Player.findObjects(object.x, object.y);
        Player.handleFoundObjectIds(allFoundObjectIds);
        Map.hideScoutMarker();
        Props.changePlayerProp('energy', energy);
        ActionsUtils.spawnCreaturesIfInfested(cardId, true);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateResting: function (actionsOrchestration, cardId, time, energy) {
    Map.showScoutMarkerFor(cardId);
    if (Props.getGameProp('timeMode') === 'night') {
      energy += 5;
    }
    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        Props.changePlayerProp('energy', energy);
        Props.changePlayerProp('health', Math.floor(energy / 2));
        Props.changePlayerProp('food', -10);
        Props.changePlayerProp('thirst', -14);
        Map.hideScoutMarker();
        actionsOrchestration.goBackFromAction(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateSleeping: function (actionsOrchestration, cardId, time, energy) {
    Map.showScoutMarkerFor(cardId);
    if (Props.getGameProp('timeMode') === 'night') {
      energy += 20;
    }
    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        Props.changePlayerProp('energy', energy);
        Props.changePlayerProp('health', Math.floor(energy / 2));
        Props.changePlayerProp('food', -18);
        Props.changePlayerProp('thirst', -24);
        Map.hideScoutMarker();
        actionsOrchestration.goBackFromAction(cardId);
      },
      cardId,
      time,
      100,
      energy
    );
  },

  simulateCooking: async function (actionsOrchestration, cardId) {
    const cardRef = Cards.getCardById(cardId);
    await TimingUtils.wait(800);
    Cooking.start(cardRef);
    actionsOrchestration.goBackFromAction(cardId);
  },

  simulateCollecting: async function (actionsOrchestration, cardId, energy) {
    const object = Props.getObject(cardId);
    object.removed = true;
    await TimingUtils.wait(1200);
    Props.addItemToInventory(object.name, 1);
    Props.changePlayerProp('energy', energy);
    actionsOrchestration.goBackFromAction(cardId);
  },

  simulateEquipping: async function (actionsOrchestration, cardId) {
    await TimingUtils.wait(800);
    const object = Props.getObject(cardId);
    if (object.group === 'weapon' && object.name) {
      Props.addWeaponToInventory(object.name, 1, {
        durability: object.durability,
        damage: object.attack,
        protection: object.defense,
      });
    }
    actionsOrchestration.goBackFromAction(cardId);
  },

  simulateCuttingDown: function (actionsOrchestration, cardId, time, energy) {
    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);
    Audio.sfx('chop-wood', 1600);

    const object = Props.getObject(cardId);
    object.removed = true;

    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        actionsOrchestration.goBackFromAction(cardId);
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

  simulateLuring: async function (actionsOrchestration, cardId, time, energy) {
    Player.lockMovement(true);
    Cards.disableActions();

    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(Player.getPlayerPosition().x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(Player.getPlayerPosition().y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    actionsOrchestration.fastForward(
      actionsOrchestration,
      async function (actionsOrchestration, cardId, energy) {
        const object = Props.getObject(cardId);
        actionsOrchestration.endAction(cardId);

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
          await TimingUtils.wait(200);
          cardRef?.classList.remove('card-heavy-shake');
          Cards.renderCardDeck();
        }
      },
      cardId,
      time,
      1600,
      energy
    );
  },

  simulateAttacking: async function (actionsOrchestration, cardId) {
    const object = Props.getObject(cardId);
    const allFoundObjectIds = Player.findObjects(object.x, object.y);

    const zedsOnly = allFoundObjectIds.filter(
      singleObject => Props.getObject(singleObject).group === 'zombie'
    );
    Cards.showAllZedsNearby();
    Player.handleFoundObjectIds(zedsOnly);
    Cards.disableActions();

    await TimingUtils.wait(800);
    actionsOrchestration.endAction(cardId);
    Battle.startBattle();
  },

  simulateBreaking: function (actionsOrchestration, cardId, time, energy) {
    Audio.sfx('chop-wood');
    Audio.sfx('chop-wood', 800);

    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        const object = Props.getObject(cardId);
        object.locked = false;
        if (Items.inventoryContains('improvised-axe')) {
          Props.addWeaponToInventory('improvised-axe', 0, { durability: -1 });
        } else if (Items.inventoryContains('axe')) {
          Props.addWeaponToInventory('axe', 0, { durability: -1 });
        }
        Props.changePlayerProp('energy', energy);
        actionsOrchestration.goBackFromAction(cardId);
        ActionsUtils.spawnCreaturesIfInfested(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateOpening: function (actionsOrchestration, cardId, time, energy) {
    Audio.sfx('unlock', 0, 0.6);

    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        const object = Props.getObject(cardId);
        object.locked = false;
        if (Items.inventoryContains('key')) {
          Props.addItemToInventory('key', -1);
        }
        Props.changePlayerProp('energy', energy);
        actionsOrchestration.goBackFromAction(cardId);
        ActionsUtils.spawnCreaturesIfInfested(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  simulateSmashing: function (actionsOrchestration, cardId, time, energy) {
    Audio.sfx('break-glass', 350);

    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
        const object = Props.getObject(cardId);
        object.locked = false;
        Props.changePlayerProp('energy', energy);
        actionsOrchestration.goBackFromAction(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  drinking: function (actionsOrchestration, cardId, time) {
    Audio.sfx('water');
    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId) {
        Props.changePlayerProp('thirst', 50);
        actionsOrchestration.goBackFromAction(cardId);
      },
      cardId,
      time,
      800
    );
  },

  fishing: function (actionsOrchestration, cardId, time, energy) {
    Audio.sfx('water-dip');
    Map.showScoutMarkerFor(cardId);
    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId, energy) {
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
        actionsOrchestration.goBackFromAction(cardId);
      },
      cardId,
      time,
      800,
      energy
    );
  },

  chomping: function (actionsOrchestration, cardId, time, energy) {
    Player.lockMovement(true);
    Cards.disableActions();
    Audio.sfx('bark');

    const scoutMarker = document.getElementById('scoutmarker');
    scoutMarker.style.left = Math.round(Player.getPlayerPosition().x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(Player.getPlayerPosition().y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');

    actionsOrchestration.fastForward(
      actionsOrchestration,
      function (actionsOrchestration, cardId) {
        actionsOrchestration.endAction(cardId);
        Map.hideScoutMarker();
        Battle.startCompanionBattle(cardId);
      },
      cardId,
      time,
      400,
      energy
    );
  },

  reading: async function (actionsOrchestration, cardId) {
    await TimingUtils.wait(1800);
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
    actionsOrchestration.goBackFromAction(cardId);
  },
};
