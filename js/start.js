import Audio from './audio.js'
import Player from './player.js'
import Props from './props.js'

let startMode = 1;

export default {
  
  init() {
    document.body.addEventListener('click', this.handleClick.bind(this));
    document.body.addEventListener('keypress', this.handleKeypress.bind(this));
    this.bind();
  },

  bind: function() {
  },

  handleClick: function(ev) {

    const target = ev.target;
    const startscreenAction = target.closest('#startscreen');
    const leftMouseButton = (ev.button === 0);

    if (startMode === 1) {
      this.switchToScreen2();
      Audio.playAmbientLoop();
    } else if (leftMouseButton) {
      if (startscreenAction) {
        ev.preventDefault();
        ev.stopPropagation();
        const action = target.closest('.button');
        const slider = target.closest('.slider');
        const href = target.getAttribute('data-href');
        if (action) {
          Audio.sfx('click');
          if (action.classList.contains('start-real')) {
            document.getElementById('startscreen').style.opacity = 0;
            Props.setupAllEvents();
            Player.findAndHandleObjects();
            Props.setGameProp('gamePaused', false);
            window.setTimeout(function() {
              document.getElementById('startscreen').classList.add('is--hidden');
            }, 1500);
          } else if (action.classList.contains('start-tutorial')) {
            document.getElementById('startscreen').style.opacity = 0;
            Props.setGameProp('tutorial', true);
            Props.setupAllEvents();
            Player.findAndHandleObjects();
            Props.setGameProp('gamePaused', false);
            window.setTimeout(function() {
              document.getElementById('startscreen').classList.add('is--hidden');
            }, 1500);          
          } else if (action.classList.contains('restart')) {
            window.setTimeout(function() {
              document.location.reload();
            }, 300);
          }
          if (document.getElementById('touchsupport')?.classList.contains('on')) {
            document.getElementById('touchcontrols')?.classList.remove('is--hidden');
          }
        }
        if (slider) {
          Audio.sfx('click');
          slider.classList.toggle('on');
        }
        if (href && href !== '#') {
          window.open( href, '_blank');
        }
      }
    }
  },

  handleKeypress: function(ev) {
    this.switchToScreen2();
  },

  switchToScreen2: function() {
    startMode = 2;
    document.querySelector('#startscreen .screen__1').classList.add('is--hidden');
    document.querySelector('#startscreen .screen__2').classList.remove('is--hidden');
  }

}