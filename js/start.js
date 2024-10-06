import { default as Audio } from './audio.js'
import { default as Player } from './player.js'
import { default as Props } from './props.js'
import { default as Items } from './items.js'
import { default as Crafting } from './crafting.js'
import { default as Tutorial } from './tutorial.js'
import { default as Ui } from './ui.js'

const saveCheckpoint = JSON.parse(localStorage.getItem("saveCheckpoint"));
const startscreenContainer = document.getElementById('startscreen');

export default {
  
  init: function() {
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

  initCharacterSelection: function() {
    const character = Props.getGameProp('character');
    // preselect game character
    document.querySelector('.button[data-character="' + character + '"]')?.parentNode.classList.add('is--selected');
    document.querySelector('.screen__menu div[data-character="' + character + '"]')?.classList.add('is--selected');
    this.presetCharacterInventory();
  },

  presetCharacterInventory: function() {
    const character = Props.getGameProp('character');
    const inventoryPresets = Props.getInventoryPresets(character);
    const inventoryPresetsContainer = document.getElementById('inventory-presets');
    if (inventoryPresets && Object.keys(inventoryPresets).length) {
      document.querySelector('.screen__menu .button.start-game').classList.remove('not--available');
      inventoryPresetsContainer.innerHTML = '';
      for (let item in inventoryPresets) {
        inventoryPresetsContainer.innerHTML += '<li class="filled"><span class="amount">' + inventoryPresets[item] + '</span><img class="item" src="img/items/' + item + '.PNG"></li>';
      };
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

  initProps: function() {
    
    const inventoryPresets = Props.getInventoryPresets(Props.getGameProp('character'));

    // TESTING
    /*
    if (Props.getGameProp('local')) {
      Props.addToInventory('wooden-club', 1, 2);
      Props.addToInventory('improvised-axe', 1, 2);
    }
      */

    if (inventoryPresets && Object.keys(inventoryPresets).length) {
      for (let item in inventoryPresets) {
        Props.addToInventory(item, inventoryPresets[item]);
      }
    }
    // add zero items to present crafting options in Almanac
    // fix this in the almanach
    Props.addToInventory('tape', 0);
    Props.addToInventory('sharp-stick', 0);
    Props.addToInventory('wooden-club', 0, 0);
    Props.addToInventory('improvised-axe', 0, 0);

    Props.modifyObjectProperties();

    Items.generateInventorySlots();
    Items.fillInventorySlots();
    Crafting.checkCraftingPrerequisits();

    // generate all buildings and zeds
    Props.setupAllBuildings();
    Props.setupAllZeds();

    Player.setPlayerPosition(18, 44);
    //Player.setPlayerPosition(35, 42);
    
    Player.changeProps('health', 100);
    Player.changeProps('food', 65);
    Player.changeProps('thirst', 70);
    Player.changeProps('energy', 75);

    Player.init();
    Items.init();
  },

  restoreCheckpoint: function(saveCheckpoint) {
    if (saveCheckpoint) {
      const inventoryItems = saveCheckpoint.inventoryItems;
        
      // add zero items to present crafting options in Almanac
      Props.addToInventory('tape', 0);
      Props.addToInventory('sharp-stick', 0);
      Props.addToInventory('wooden-club', 0, 0);
      Props.addToInventory('improvised-axe', 0, 0);
  
      for (var key in inventoryItems) {
        Props.addToInventory(inventoryItems[key].name, inventoryItems[key].amount, inventoryItems[key].durability);
      }
  
      if (saveCheckpoint.playerCharacter) {
        Props.setGameProp('character', saveCheckpoint.playerCharacter);
      }

      Props.modifyObjectProperties();

      Items.generateInventorySlots();
      Items.fillInventorySlots();    

      // generate all buildings and zeds
      Props.setupAllBuildings();
      Props.setupAllZeds();
  
      Player.setPlayerPosition(saveCheckpoint.playerPosition.x, saveCheckpoint.playerPosition.y);

      Player.changeProps('health', saveCheckpoint.playerStats.health);
      Player.changeProps('food', saveCheckpoint.playerStats.food);
      Player.changeProps('thirst', saveCheckpoint.playerStats.thirst);
      Player.changeProps('energy', saveCheckpoint.playerStats.energy);

      window.timeIsUnity.gameTick = saveCheckpoint.gameTime.gameTick;
      window.timeIsUnity.gameHours = saveCheckpoint.gameTime.gameHours;
      window.timeIsUnity.gameDays = saveCheckpoint.gameTime.gameDays;
      window.timeIsUnity.todayHours = saveCheckpoint.gameTime.todayHours;
      window.timeIsUnity.todayTime = saveCheckpoint.gameTime.todayTime;
      Props.setGameProp('startDay', saveCheckpoint.gameTime.gameDays)
  
      Ui.updateDayNightLayers(saveCheckpoint.gameTime.todayHours);

      if (saveCheckpoint.gameTime.todayHours >= 21 || saveCheckpoint.gameTime.todayHours < 5) {
        Ui.switchDayNight(21);
      } else {
        Ui.switchDayNight(5);
      }
      if (saveCheckpoint.gameTime.todayHours >= 23 || saveCheckpoint.gameTime.todayHours < 5) {
        Ui.triggerNight();
      }
      Player.init();
      Items.init();  
    }
  },

  handleClick: function(ev) {

    const target = ev.target;
    const startscreenAction = target.closest('#startscreen');
    const leftMouseButton = (ev.button === 0);

    if (Props.getGameProp('startMode') === 1) {
      this.switchToScreen2();
    } else if (leftMouseButton) {
      if (startscreenAction) {
        ev.preventDefault();
        ev.stopPropagation();
        const action = target.closest('.button');
        const slider = target.closest('.slider');
        const href = target.getAttribute('data-href');
        const character = target.closest('.button')?.getAttribute('data-character');
        if (action) {
          if (action.classList.contains('start-real')) {
            Audio.sfx('click');
            localStorage.removeItem("saveCheckpoint");
            this.prepareGameStart();
            this.chooseCharacter();
          } else if (action.classList.contains('start-game')) {
            if (!action.classList.contains('not--available')) {
              Audio.sfx('click');
              this.initProps();
              this.startReal();
            } else {
              Audio.sfx('nope');
            }
          } else if (action.classList.contains('back-screen-2')) {
            Audio.sfx('click');
            this.switchToScreen2();
          } else if (action.classList.contains('continue-real')) {
            Audio.sfx('click');
            this.restoreCheckpoint(saveCheckpoint);
            this.prepareGameStart();
            this.startReal();
          } else if (action.classList.contains('start-tutorial')) {
            this.prepareGameStart();
            this.switchToScreen3();
          } else if (action.classList.contains('restart')) {
            window.setTimeout(function() {
              document.location.reload();
            }, 300);
          } else if (action.classList.contains('resume')) {
            startscreenContainer.querySelector('.screen__quit').classList.add('is--hidden');
            startscreenContainer.classList.add('is--hidden');
            startscreenContainer.style.opacity = 0;
            Ui.showUI();
          } else if (action.classList.contains('card-tutorial-confirm')) {
            this.prepareGameStart();
            this.startTutorial();
          } else if (character) {
            Audio.sfx('click');
            document.querySelector('.screen__menu div[data-character].is--selected')?.classList.remove('is--selected');
            document.querySelector('.screen__menu div[data-character="' + character + '"]')?.classList.add('is--selected');
            document.querySelector('#startscreen .character__button.is--selected')?.classList.remove('is--selected');
            target.closest('.character__button').classList.add('is--selected');
            Props.setGameProp('character', character);
            this.presetCharacterInventory();
          }
        }
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
        if (href && href !== '#') {
          window.open( href, '_blank');
        }
      }
    }
  },

  handleMove: function(ev) {
    let translateX = (window.innerWidth / 2 - ev.clientX),
        translateY = (window.innerHeight / 2 - ev.clientY),
        translateRatio = window.innerWidth / 80;

    startscreenContainer.style.backgroundPositionX = (translateX / translateRatio - 50) + 'px';
    startscreenContainer.style.backgroundPositionY = (translateY / translateRatio - 30) + 'px';
  },

  prepareGameStart: function() {
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

  chooseCharacter: function() {
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.remove('is--hidden');
  },

  startReal: function() {
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.add('is--hidden');
    this.startGame();
  },

  startTutorial: function() {
    Props.setGameProp('tutorial', true);
    this.initProps();
    this.startGame();
  },

  startGame: function() {
    startscreenContainer.style.opacity = 0;
    Tutorial.setupAllEvents();
    Player.findAndHandleObjects();
    Props.pauseGame(false);
    Audio.playAmbientLoop();
    Ui.showMapBorder();
    window.setTimeout(function() {
      startscreenContainer.classList.add('is--hidden');
      Ui.showNewDay(0, true);
    }, 1500);
  },

  handleKeypress: function(ev) {
    if (Props.getGameProp('startMode') === 1) {
      this.switchToScreen2();
    }
  },

  switchToScreen2: function() {
    Props.setGameProp('startMode', 2);
    document.querySelector('#startscreen .screen__1').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2').classList.remove('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__update').classList.remove('is--hidden');
  },

  switchToScreen3: function() {
    Audio.sfx('shuffle-paper');
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__update').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__3').classList.remove('is--hidden');
    document.getElementById('tutorial-beginning').classList.remove('is--hidden');
  }

}