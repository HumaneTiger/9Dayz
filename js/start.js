import { default as Audio } from './audio.js';
import { default as Player } from './player.js';
import { default as Props } from './props.js';
import { default as Items } from './items.js';
import { default as Crafting } from './crafting.js';
import { default as Tutorial } from './tutorial.js';
import { default as Ui } from './ui.js';
import { default as Checkpoint } from './checkpoint.js';
import { default as Character } from './character.js';
import { default as Cooking } from './cooking.js';
import { default as Editor } from './editor.js';
import RngUtils from './utils/rng-utils.js';
import TimingUtils from './utils/timing-utils.js';

const saveCheckpoint = JSON.parse(localStorage.getItem('saveCheckpoint'));
const startscreenContainer = document.getElementById('startscreen');

export default {
  init: function () {
    document.body.addEventListener('mousedown', this.handleClick.bind(this));
    document.body.addEventListener('keypress', this.handleKeypress.bind(this));
    startscreenContainer.addEventListener('mousemove', this.handleMove.bind(this));
    Props.setGameProp('startMode', 1);
    if (saveCheckpoint !== null) {
      document.getElementById('start-option-new').classList.add('is--hidden');
      document.getElementById('start-option-continue').classList.remove('is--hidden');
    } else {
      document.getElementById('start-option-new').classList.remove('is--hidden');
      document.getElementById('start-option-continue').classList.add('is--hidden');
    }
    // start game immediately in local dev mode
    /*
    if (Props.getGameProp('local')) {
      document.querySelector('#startscreen .screen__1').classList.add('is--hidden');
      document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
      Props.setGameProp('startMode', 2);
      this.prepareGameStart();
      this.initProps();
      this.startReal();
    }
    */
    this.initCharacterSelection();
  },

  initCharacterSelection: function () {
    const character = Props.getGameProp('character');
    // preselect game character
    document
      .querySelector('.button[data-character="' + character + '"]')
      ?.parentNode.classList.add('is--selected');
    document
      .querySelector('.screen__menu div[data-character="' + character + '"]')
      ?.classList.add('is--selected');
    this.presetCharacterInventory();
  },

  presetCharacterInventory: function () {
    const character = Props.getGameProp('character');
    const inventoryPresets = Props.getInventoryPresets(character);
    const inventoryPresetsContainer = document.getElementById('inventory-presets');
    if (inventoryPresets && Object.keys(inventoryPresets).length) {
      document.querySelector('.screen__menu .button.start-game').classList.remove('not--available');
      inventoryPresetsContainer.innerHTML = '';
      for (let item in inventoryPresets) {
        inventoryPresetsContainer.innerHTML +=
          '<li class="filled"><span class="amount">' +
          inventoryPresets[item] +
          '</span><img class="item" src="img/items/' +
          item +
          '.PNG"></li>';
      }
      for (let i = 0; i < 6 - Object.keys(inventoryPresets).length; i += 1) {
        inventoryPresetsContainer.innerHTML += '<li class="empty"></li>';
      }
    } else {
      document.querySelector('.screen__menu .button.start-game').classList.add('not--available');
      inventoryPresetsContainer.innerHTML = '';
      for (let i = 0; i < 6; i += 1) {
        inventoryPresetsContainer.innerHTML += '<li class="empty"></li>';
      }
    }
  },

  initProps: function () {
    const inventoryPresets = Props.getInventoryPresets(Props.getGameProp('character'));
    RngUtils.init(Props.getGameProp('gameSeed'));

    // TESTING
    Props.beginInventoryBatch();
    /*if (Props.getGameProp('local')) {
      Props.addWeaponToInventory('wooden-club', 1, { durability: 2 });
      Props.addWeaponToInventory('improvised-axe', 1, { durability: 2 });
      Props.addItemToInventory('bones', 2);
      Props.addItemToInventory('meat', 2);
      Props.addItemToInventory('tape', 1);
    }*/
    if (inventoryPresets && Object.keys(inventoryPresets).length) {
      for (let item in inventoryPresets) {
        Props.addItemToInventory(item, inventoryPresets[item]);
      }
    }
    // add zero items to present crafting options in Almanac
    // TODO: fix this in the almanach
    Props.addItemToInventory('tape', 0);
    Props.addItemToInventory('sharp-stick', 0);
    Props.addItemToInventory('rope', 0);
    Props.addItemToInventory('bone-hook', 0);
    Props.addWeaponToInventory('wooden-club', 0, { durability: 0 });
    Props.addWeaponToInventory('improvised-axe', 0, { durability: 0 });
    Props.addWeaponToInventory('improvised-whip', 0, { durability: 0 });
    Props.addWeaponToInventory('fishing-rod', 0, { durability: 0 });
    Props.endInventoryBatch();

    Props.modifyObjectProperties();
    Items.generateInventorySlots();
    Items.fillInventorySlots();
    Character.updateWeaponState();
    Cooking.checkAllCookingModeCards();
    Crafting.checkCraftingPrerequisits();

    Props.spawnDoggyAt(12, 44);

    // generate all buildings and zeds
    Props.setupAllBuildings();
    Props.setupAllZeds();

    Player.setPlayerPosition(
      Props.getGameProp('playerPosition').x,
      Props.getGameProp('playerPosition').y
    );
    //Player.setPlayerPosition(18, 37);

    Props.changePlayerProp('health', 100);
    Props.changePlayerProp('food', 65);
    Props.changePlayerProp('thirst', 70);
    Props.changePlayerProp('energy', 75);

    Player.init();
    Items.init();
  },

  restoreCheckpoint: function (saveCheckpoint) {
    Checkpoint.restore(saveCheckpoint);
    RngUtils.init(Props.getGameProp('gameSeed'));
    Player.init();
    Items.init();
  },

  // just finds a class among a predefined set
  getActionType: function (element) {
    const classes = [
      'start-real',
      'start-game',
      'back-screen-2',
      'continue-real',
      'start-tutorial',
      'restart',
      'resume',
      'card-tutorial-confirm',
    ];
    return classes.find(cls => element.classList.contains(cls));
  },

  handleClick: async function (ev) {
    const target = ev.target;
    const leftMouseButton = ev.button === 0;

    if (Props.getGameProp('startMode') === 1) {
      this.switchToScreen2();
      return;
    }

    const startscreenAction = target.closest('#startscreen');
    if (startscreenAction && leftMouseButton) {
      ev.preventDefault();
      ev.stopPropagation();

      // Handle action buttons
      const action = target.closest('.button');
      if (action) {
        const actionType = this.getActionType(action);
        switch (actionType) {
          case 'start-real':
            Audio.sfx('click');
            localStorage.removeItem('saveCheckpoint');
            this.prepareGameStart();
            this.chooseCharacter();
            break;
          case 'start-game':
            if (!action.classList.contains('not--available')) {
              Audio.sfx('click');
              this.initProps();
              this.startReal();
            } else {
              Audio.sfx('nope');
            }
            break;
          case 'back-screen-2':
            Audio.sfx('click');
            this.switchToScreen2();
            break;
          case 'continue-real':
            Audio.sfx('click');
            this.restoreCheckpoint(saveCheckpoint);
            this.prepareGameStart();
            this.startReal();
            break;
          case 'start-tutorial':
            this.prepareGameStart();
            this.switchToScreen3();
            break;
          case 'restart':
            await TimingUtils.wait(300);
            document.location.reload();
            break;
          case 'resume':
            startscreenContainer.querySelector('.screen__quit').classList.add('is--hidden');
            startscreenContainer.classList.add('is--hidden');
            startscreenContainer.style.opacity = 0;
            Ui.showUI();
            break;
          case 'card-tutorial-confirm':
            this.prepareGameStart();
            this.startTutorial();
            break;
          default: {
            const character = target.closest('.button')?.getAttribute('data-character');
            if (character) {
              Audio.sfx('click');
              document
                .querySelector('.screen__menu div[data-character].is--selected')
                ?.classList.remove('is--selected');
              document
                .querySelector('.screen__menu div[data-character="' + character + '"]')
                ?.classList.add('is--selected');
              document
                .querySelector('#startscreen .character__button.is--selected')
                ?.classList.remove('is--selected');
              target.closest('.character__button').classList.add('is--selected');
              Props.setGameProp('character', character);
              this.presetCharacterInventory();
            }
            break;
          }
        }
      }

      // Handle sliders
      const slider = target.closest('.slider');
      if (slider) {
        Audio.sfx('click');
        if (slider.id && slider.id === 'fullscreen') {
          if (slider.classList.contains('on')) {
            slider.classList.remove('on');
          } else {
            slider.classList.add('on');
          }
        } else {
          slider.classList.toggle('on');
        }
      }

      // Handle external links
      const href = target.getAttribute('data-href');
      if (href && href !== '#') {
        window.open(href, '_blank');
      }

      // handle test suite
      const testPlayback = target.closest('.start-test-playback');
      if (testPlayback) {
        Editor.startPlayback();
      }
    }
  },

  handleMove: function (ev) {
    let translateX = window.innerWidth / 2 - ev.clientX,
      translateY = window.innerHeight / 2 - ev.clientY,
      translateRatio = window.innerWidth / 80;

    startscreenContainer.style.backgroundPositionX = translateX / translateRatio - 50 + 'px';
    startscreenContainer.style.backgroundPositionY = translateY / translateRatio - 30 + 'px';
  },

  prepareGameStart: function () {
    document.querySelector('#startscreen .screen__update').classList.add('is--hidden');
    if (document.getElementById('touchsupport')?.classList.contains('on')) {
      document.getElementById('touchcontrols')?.classList.remove('is--hidden');
      document.getElementById('character')?.classList.add('touchcontrols');
    }
    if (document.getElementById('fullscreen')?.classList.contains('on')) {
      if (document.fullscreenEnabled) {
        document.documentElement.requestFullscreen();
      }
    }
  },

  chooseCharacter: function () {
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.remove('is--hidden');
  },

  startReal: function () {
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.add('is--hidden');
    document
      .getElementById('card-console')
      .querySelector('.start-playback')
      .classList.add('is--hidden');
    document
      .getElementById('card-console')
      .querySelector('.start-recording')
      .classList.remove('is--hidden');
    this.startGame();
  },

  startTutorial: function () {
    Props.setGameProp('tutorial', true);
    this.initProps();
    this.startGame();
  },

  startGame: async function () {
    Tutorial.setupAllEvents();
    Player.findAndHandleObjects();
    Props.pauseGame(false);
    Audio.playAmbientLoop();
    Ui.showMapBorder();
    await this.fadeIntoGame();
    Ui.showNewDay(0, true);
  },

  fadeIntoGame: async function () {
    startscreenContainer.style.opacity = 0;
    await TimingUtils.waitForTransition(startscreenContainer);
    startscreenContainer.classList.add('is--hidden');
  },

  handleKeypress: function () {
    if (Props.getGameProp('startMode') === 1) {
      this.switchToScreen2();
    }
  },

  switchToScreen2: function () {
    Props.setGameProp('startMode', 2);
    document.querySelector('#startscreen .screen__1').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2').classList.remove('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__update').classList.remove('is--hidden');
    document.querySelector('#startscreen .development-build').innerHTML +=
      ' - <span class="start-test-playback">Start Test Playback</span>';
  },

  switchToScreen3: function () {
    Audio.sfx('shuffle-paper');
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__update').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__3').classList.remove('is--hidden');
    document.getElementById('tutorial-beginning').classList.remove('is--hidden');
  },
};
