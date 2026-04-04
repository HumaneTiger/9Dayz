import Props from './props.js';
import Player from './player.js';
import Items from './items.js';
import Audio from './audio.js';
import TimingUtils from './utils/timing-utils.js';
import { TutorialManager, CardsManager, PlayerManager } from './core/index.js';
import { CardsDefinitions } from '../data/index.js';

let battleTutorialStep = 0,
  introTutorialStep = 0;

export default {
  init: function () {
    document.body.addEventListener('keypress', this.handleUserInput.bind(this));
    document.body.addEventListener('mousedown', this.handleUserInput.bind(this));
  },

  setupAllEvents: function () {
    const events = TutorialManager.getTutorialEvents();
    for (var event in events) {
      if (Props.getGameProp('tutorial') || events[event].showAlways) {
        const x = parseInt(event.split('-')[0]);
        const y = parseInt(event.split('-')[1]);
        Props.setEventAt(x, y, events[event].title, events[event].text);
      }
    }
  },

  setupSpecialEvent: function (event, x, y) {
    const specialEvents = TutorialManager.getSpecialEvents();
    const currentObjectsIdCounter = Props.setEventAt(
      x,
      y,
      specialEvents[event].title,
      specialEvents[event].text
    );
    return currentObjectsIdCounter;
  },

  handleUserInput: function () {
    if (Props.getGameProp('tutorialIntro')) {
      this.continueIntroTutorial();
    } else if (Props.getGameProp('tutorialBattle')) {
      this.continueBattleTutorial();
    }
  },

  triggerIntroTutorial: async function () {
    const mainContainer = document.querySelector('#viewport main');
    if (!document.getElementById('tutorial-intro')) {
      mainContainer.insertAdjacentHTML(
        'afterend',
        `
      <div id="tutorial-intro">
        <img src="./img/tutorial/intro-step-1.png" class="tutorial-step intro-tutorial-step-1 fading">
        <img src="./img/tutorial/intro-step-2.png" class="tutorial-step intro-tutorial-step-2">
        <img src="./img/tutorial/intro-step-3.png" class="tutorial-step intro-tutorial-step-3">
        <p class="screen__paragraph align--center text--smedium hint-continue to--center pulsate is--hidden">
          <span class="current-step">1/3</span>
          Press any key to continue...
        </p>
      </div>
    `
      );
    }
    await TimingUtils.wait(1500);
    Props.setGameProp('tutorialIntro', true);
    document.querySelector('.intro-tutorial-step-1').classList.add('is--active');
    document.querySelector('.hint-continue').classList.remove('is--hidden');
  },

  continueIntroTutorial: function () {
    introTutorialStep++;
    console.log(introTutorialStep);
    switch (introTutorialStep) {
      case 1:
        document.querySelector('.intro-tutorial-step-1').classList.remove('is--active');
        document.querySelector('.intro-tutorial-step-2').classList.add('is--active');
        document.querySelector('.hint-continue span').textContent = '2/3';
        document.querySelector('.hint-continue').classList.remove('to--center');
        break;
      case 2:
        document.querySelector('.intro-tutorial-step-2').classList.remove('is--active');
        document.querySelector('.intro-tutorial-step-3').classList.add('is--active');
        document.querySelector('.hint-continue span').textContent = '3/3';
        document.querySelector('.hint-continue').classList.add('to--center');
        break;
      default:
        Props.setGameProp('tutorialIntro', false);
        introTutorialStep = 0;
        document.querySelector('.intro-tutorial-step-3').classList.remove('is--active');
        TimingUtils.wait(500);
        document.getElementById('tutorial-intro').remove();
        Props.pauseGame(false);
        break;
    }
  },

  triggerBattleTutorial: function () {
    Props.setGameProp('tutorialBattle', true);
    const mainContainer = document.querySelector('#viewport main');
    if (!document.getElementById('tutorial-battle')) {
      mainContainer.insertAdjacentHTML(
        'afterend',
        `
      <div id="tutorial-battle">
        <img src="./img/tutorial/step-1.png" class="tutorial-step tutorial-step-1 is--active">
        <img src="./img/tutorial/step-2.png" class="tutorial-step tutorial-step-2">
        <img src="./img/tutorial/step-3.png" class="tutorial-step tutorial-step-3">
        <img src="./img/tutorial/step-4.png" class="tutorial-step tutorial-step-4">
        <img src="./img/tutorial/step-4a.png" class="tutorial-step tutorial-step-4a">
        <img src="./img/tutorial/step-5.png" class="tutorial-step tutorial-step-5">
        <img src="./img/tutorial/general-notes.png" class="tutorial-notes-headline">
        <img src="./img/tutorial/note-1.png" class="tutorial-notes tutorial-note-1">
        <img src="./img/tutorial/note-2.png" class="tutorial-notes tutorial-note-2 is--out">
        <img src="./img/tutorial/note-3.png" class="tutorial-notes tutorial-note-3 is--out">
        <img src="./img/tutorial/note-4.png" class="tutorial-notes tutorial-note-4 is--out">

        <p class="screen__paragraph align--center text--smedium hint-continue pulsate">
          Press any key to continue...
        </p>
      </div>
    `
      );
    }
  },

  continueBattleTutorial: function () {
    battleTutorialStep++;
    switch (battleTutorialStep) {
      case 1:
        document.querySelector('.tutorial-step-1').classList.remove('is--active');
        document.querySelector('.tutorial-step-2').classList.add('is--active');
        break;
      case 2:
        document.querySelector('.tutorial-step-2').classList.remove('is--active');
        document.querySelector('.tutorial-step-3').classList.add('is--active');
        document.querySelector('.hint-continue').classList.add('to--left');
        Audio.sfx('shuffle-paper');
        document.querySelector('.tutorial-note-2').classList.remove('is--out');
        break;
      case 3:
        document.querySelector('.tutorial-step-3').classList.remove('is--active');
        if (CardsDefinitions.opponentDeck.length % 2 === 0) {
          document.querySelector('.tutorial-step-4a').classList.add('is--active');
        } else {
          document.querySelector('.tutorial-step-4').classList.add('is--active');
        }
        document.querySelector('.hint-continue').classList.remove('to--left');
        Audio.sfx('shuffle-paper');
        document.querySelector('.tutorial-note-3').classList.remove('is--out');
        break;
      case 4:
        document.querySelector('.tutorial-step-4').classList.remove('is--active');
        document.querySelector('.tutorial-step-4a').classList.remove('is--active');
        document.querySelector('.tutorial-step-5').classList.add('is--active');
        Audio.sfx('shuffle-paper');
        document.querySelector('.tutorial-note-4').classList.remove('is--out');
        break;
      default:
        Props.setGameProp('tutorialBattle', false);
        battleTutorialStep = 0;
        document.querySelector('.tutorial-step-5').classList.remove('is--active');
        TimingUtils.wait(500);
        document.getElementById('tutorial-battle').remove();
        break;
    }
  },

  checkForSpecialEvents: function () {
    let specialEventObjectIds = [];

    if (Props.getGameProp('tutorial')) {
      const playerPosition = Player.getPlayerPosition();
      const crafting = Props.getCrafting();
      CardsManager.getCardDeck().forEach(card => {
        const id = card.id;
        let object = Props.getObject(id);

        if (object.infested && !Props.getGameProp('firstInfestation')) {
          Props.setGameProp('firstInfestation', true);
          let objectId = this.setupSpecialEvent('infestation', playerPosition.x, playerPosition.y);
          specialEventObjectIds.push(objectId);
        }
        if (object.type === 'corpse' && !Props.getGameProp('firstCorpse')) {
          Props.setGameProp('firstCorpse', true);
          let objectId = this.setupSpecialEvent('corpse', playerPosition.x, playerPosition.y);
          specialEventObjectIds.push(objectId);
        }
        if (object.locked && !Props.getGameProp('firstLocked')) {
          Props.setGameProp('firstLocked', true);
          if (object.type === 'car') {
            let objectId = this.setupSpecialEvent('locked-car', playerPosition.x, playerPosition.y);
            specialEventObjectIds.push(objectId);
          } else {
            let objectId = this.setupSpecialEvent(
              'locked-building',
              playerPosition.x,
              playerPosition.y
            );
            specialEventObjectIds.push(objectId);
          }
        }
        /*if (object.zednearby && !Props.getGameProp('firstZedNearby')) {
          Props.setGameProp('firstZedNearby', true);
          let objectId = this.setupSpecialEvent(
            'hostiles-nearby',
            playerPosition.x,
            playerPosition.y
          );
          specialEventObjectIds.push(objectId);
        }*/
        if (
          object.dead &&
          (object.group === 'animal' || object.type === 'rat') &&
          !Props.getGameProp('firstDeadAnimal')
        ) {
          Props.setGameProp('firstDeadAnimal', true);
          let objectId = this.setupSpecialEvent('dead-animal', playerPosition.x, playerPosition.y);
          specialEventObjectIds.push(objectId);
        }
        if (!object.dead && object.type === 'rat' && !Props.getGameProp('firstRatFight')) {
          Props.setGameProp('firstRatFight', true);
          let objectId = this.setupSpecialEvent('rat-fight', playerPosition.x, playerPosition.y);
          specialEventObjectIds.push(objectId);
        }
      });

      if (
        crafting.total &&
        !Props.getGameProp('firstAxeCraft') &&
        Items.inventoryContains('tape') &&
        Items.inventoryContains('branch') &&
        Items.inventoryContains('stone')
      ) {
        Props.setGameProp('firstAxeCraft', true);
        let objectId = this.setupSpecialEvent('crafting', playerPosition.x, playerPosition.y);
        specialEventObjectIds.push(objectId);
      }

      if (PlayerManager.getProp('energy') < 33 && !Props.getGameProp('firstLowEnergy')) {
        Props.setGameProp('firstLowEnergy', true);
        let objectId = this.setupSpecialEvent('low-energy', playerPosition.x, playerPosition.y);
        specialEventObjectIds.push(objectId);
      }
      /*
      if (document.getElementById('inventory').classList.contains('active') && Props.getGameProp('firstInventoryOpen') === false) {
        Props.setGameProp('firstInventoryOpen', true);
        let objectId = this.setupSpecialEvent('almanac', playerPosition.x, playerPosition.y);
        specialEventObjectIds.push(objectId);
      }*/
    }
    return specialEventObjectIds;
  },
};
