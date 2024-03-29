import { default as Audio } from './audio.js'
import { default as Player } from './player.js'
import { default as Props } from './props.js'
import { default as Items } from './items.js'
import { default as Tutorial } from './tutorial.js'
import { default as Ui } from './ui.js'

const saveCheckpoint = JSON.parse(localStorage.getItem("saveCheckpoint"));

export default {
  
  init: function() {
    document.body.addEventListener('mousedown', this.handleClick.bind(this));
    document.body.addEventListener('keypress', this.handleKeypress.bind(this));
    Props.setGameProp('startMode', 1);
    if (saveCheckpoint !== null) {
      document.getElementById('start-option-new').classList.add('is--hidden');
      document.getElementById('start-option-continue').classList.remove('is--hidden');
    } else {
      document.getElementById('start-option-new').classList.remove('is--hidden');
      document.getElementById('start-option-continue').classList.add('is--hidden');
    }
    if (Props.getGameProp('local')) {
      Props.setGameProp('startMode', 2);
      document.querySelector('#startscreen .screen__1').classList.add('is--hidden');
      document.querySelector('#startscreen .screen__2').classList.remove('is--hidden');
      document.querySelector('#startscreen .screen__update').classList.remove('is--hidden');
    }
  },

  initProps: function() {
    
    Props.addToInventory('tomato', 2);
    Props.addToInventory('drink-2', 1);
    Props.addToInventory('snack-1', 1);
    Props.addToInventory('knife', 1);
    Props.addToInventory('energy-pills', 1);
    Props.addToInventory('pepper', 1);

    // add zero items to present crafting options in Almanac
    Props.addToInventory('tape', 0);
    Props.addToInventory('sharp-stick', 0);
    Props.addToInventory('wooden-club', 0, 0);
    Props.addToInventory('improvised-axe', 0, 0);

    Items.generateInventorySlots();
    Items.fillInventorySlots();

    Player.setPlayerPosition(18, 44);
    
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
  
      Items.generateInventorySlots();
      Items.fillInventorySlots();    
  
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
        if (action) {
          if (action.classList.contains('start-real')) {
            Audio.sfx('click');
            localStorage.removeItem("saveCheckpoint");
            this.prepareGameStart();
            this.chooseCharacter();
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
            let startScreen = document.getElementById('startscreen');
            startScreen.querySelector('.screen__quit').classList.add('is--hidden');
            startScreen.classList.add('is--hidden');
            startScreen.style.opacity = 0;
            Ui.showUI();
          } else if (action.classList.contains('card-tutorial-confirm')) {
            this.prepareGameStart();
            this.startTutorial();
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

  prepareGameStart: function() {
    document.querySelector('#startscreen .screen__update').classList.add('is--hidden');
    if (document.getElementById('touchsupport')?.classList.contains('on')) {
      document.getElementById('touchcontrols')?.classList.remove('is--hidden');
    }
    if (document.getElementById('fullscreen')?.classList.contains('on')) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    }
  },

  chooseCharacter: function() {
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2a').classList.remove('is--hidden');
//    this.initProps();
//    this.startReal();
  },

  startReal: function() {
    document.getElementById('startscreen').style.opacity = 0;
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    Tutorial.setupAllEvents();
    Player.findAndHandleObjects();
    Props.setGameProp('gamePaused', false);
    Audio.playAmbientLoop();
    Ui.showMapBorder();
    window.setTimeout(function() {
      document.getElementById('startscreen').classList.add('is--hidden');
    }, 1500);
  },

  startTutorial: function() {
    document.getElementById('startscreen').style.opacity = 0;
    Props.setGameProp('tutorial', true);
    this.initProps();
    Tutorial.setupAllEvents();
    Player.findAndHandleObjects();
    Props.setGameProp('gamePaused', false);
    Audio.playAmbientLoop();
    Ui.showMapBorder();
    window.setTimeout(function() {
      document.getElementById('startscreen').classList.add('is--hidden');
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
    document.querySelector('#startscreen .screen__update').classList.remove('is--hidden');
  },

  switchToScreen3: function() {
    Audio.sfx('shuffle-paper');
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__update').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__3').classList.remove('is--hidden');
    document.getElementById('tutorial-beginning').classList.remove('is--hidden');
  }

}