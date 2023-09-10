import Audio from './audio.js'
import Player from './player.js'
import Props from './props.js'

let firstUserInteraction = false;
let gamePaused = true;

export default {
  
  init() {
    document.body.addEventListener('click', this.handleClick.bind(this));
    this.bind();
  },

  bind: function() {
  },

  handleClick: function(ev) {

    const target = ev.target;
    const startscreenAction = target.closest('#startscreen');
    const leftMouseButton = (ev.button === 0);

    if (!firstUserInteraction) {
      firstUserInteraction = true;
      Audio.init();
    }

    if (leftMouseButton) {
      if (startscreenAction) {
        ev.preventDefault();
        ev.stopPropagation();
        const action = target.closest('.button');
        const slider = target.closest('.slider');
        const href = target.getAttribute('href');
        if (action) {
          Audio.sfx('click');
          if (action.classList.contains('start-real')) {
            document.getElementById('startscreen').style.opacity = 0;
            Props.setupAllEvents();
            Player.findAndHandleObjects();
            this.setGamePaused(false);
            window.setTimeout(function() {
              document.getElementById('startscreen').classList.add('is--hidden');
            }, 1500);
          } else if (action.classList.contains('start-tutorial')) {
            document.getElementById('startscreen').style.opacity = 0;
            Props.setGameProp('tutorial', true);
            Props.setupAllEvents();
            Player.findAndHandleObjects();
            this.setGamePaused(false);
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

  isGamePaused: function() {
    return gamePaused;
  },

  setGamePaused: function(paused) {
    gamePaused = paused;
  },

  userHasInteracted: function() {
    return firstUserInteraction;
  }

}