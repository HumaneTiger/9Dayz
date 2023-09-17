import { default as Audio } from './audio.js'
import { default as Player } from './player.js'
import { default as Props } from './props.js'

let startMode = 1;

export default {
  
  init: function() {
    document.body.addEventListener('click', this.handleClick.bind(this));
    document.body.addEventListener('keypress', this.handleKeypress.bind(this));
    this.bind();
    if (Props.getGameProp('local')) {
      startMode = 2;
      document.querySelector('#startscreen .screen__1').classList.add('is--hidden');
      document.querySelector('#startscreen .screen__2').classList.remove('is--hidden');
    }
  },

  bind: function() {
  },

  handleClick: function(ev) {

    const target = ev.target;
    const startscreenAction = target.closest('#startscreen');
    const leftMouseButton = (ev.button === 0);

    if (startMode === 1) {
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
            this.startReal();
          } else if (action.classList.contains('start-tutorial')) {
            this.switchToScreen3();
          } else if (action.classList.contains('restart')) {
            window.setTimeout(function() {
              document.location.reload();
            }, 300);
          } else if (action.classList.contains('card-tutorial-confirm')) {
            this.startTutorial();
          }
          if (document.getElementById('touchsupport')?.classList.contains('on')) {
            document.getElementById('touchcontrols')?.classList.remove('is--hidden');
          }
          if (document.getElementById('fullscreen')?.classList.contains('on')) {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            }
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

  startReal: function() {
    document.getElementById('startscreen').style.opacity = 0;
    Props.setupAllEvents();
    Player.findAndHandleObjects();
    Props.setGameProp('gamePaused', false);
    Audio.playAmbientLoop();
    window.setTimeout(function() {
      document.getElementById('startscreen').classList.add('is--hidden');
    }, 1500);
  },

  startTutorial: function() {
    document.getElementById('startscreen').style.opacity = 0;
    Props.setGameProp('tutorial', true);
    Props.setupAllEvents();
    Player.findAndHandleObjects();
    Props.setGameProp('gamePaused', false);
    Audio.playAmbientLoop();
    window.setTimeout(function() {
      document.getElementById('startscreen').classList.add('is--hidden');
    }, 1500);          
  },

  handleKeypress: function(ev) {
    if (startMode === 1) {
      this.switchToScreen2();
    }
  },

  switchToScreen2: function() {
    startMode = 2;
    document.querySelector('#startscreen .screen__1').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2').classList.remove('is--hidden');
  },

  switchToScreen3: function() {
    Audio.sfx('shuffle-paper');
    document.querySelector('#startscreen .screen__2').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__3').classList.remove('is--hidden');
    document.getElementById('tutorial-beginning').classList.remove('is--hidden');
  }

}