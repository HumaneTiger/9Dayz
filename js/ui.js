import Battle from './battle.js'
import Audio from './audio.js'
import Player from './player.js'

var viewport = document.getElementById("viewport");
var mapHigh = document.querySelector('.map-high img');
var morningLight = document.querySelectorAll('.morning-light');
var eveningLight = document.querySelectorAll('.evening-light');
var nightLight = document.querySelectorAll('.night-light');
var nightCover = document.querySelectorAll('.night-ui-cover');

let newPosX = 0, newPosY = 0, startPosX = 0, startPosY = 0, initialStyleLeft = 0, initialStyleTop = 0;
let dragMode = false;
let dragEl = null;
let topIndex = 1;

export default {
  
  init() {

    window.addEventListener('resize', this.resizeViewport);
    document.body.addEventListener('click', this.handleClick.bind(this));

    document.body.addEventListener('pointerdown', this.mouseDown);
    document.body.addEventListener('pointermove', this.mouseMove.bind(this));
    document.body.addEventListener('pointerup', this.mouseUp.bind(this));

    //document.body.addEventListener("contextmenu", (ev) => { ev.preventDefault(); });

    this.bind();

  },

  bind: function() {
  },

  mouseDown(e) {
    
    let target = e.target;

    if (target) {

      if (dragMode === false && target.closest('div.battle-card')) {

        dragMode = true;

        dragEl = target.closest('div.battle-card');

        dragEl.style.zIndex = topIndex++;
        dragEl.classList.add('grabbed');
        
        startPosX = dragEl.clientX;
        startPosY = dragEl.clientY;

        initialStyleLeft = dragEl.style.left;
        initialStyleTop = dragEl.style.top;
      }
    }
  },

  mouseMove(e) {

    e.preventDefault;
    e.stopPropagation();
    
    if (dragMode) {

      let scale = window.innerHeight / 1200;
      // calculate the new position
      newPosX = (startPosX - e.clientX) / scale;
      newPosY = (startPosY - e.clientY) / scale;
  
      // with each move we also want to update the start X and Y
      startPosX = e.clientX;
      startPosY = e.clientY;

      if (dragEl) {
        // set the element's new position:
        dragEl.style.top = (dragEl.offsetTop - newPosY) + "px";
        dragEl.style.left = (dragEl.offsetLeft - newPosX) + "px";  
        let dragTarget = this.getDragTarget(e);
        if (dragTarget) {
          dragTarget.classList.add('active');
        }
      }
    }  
  },

  mouseUp(e) {
    if (dragMode) {
      let dragTarget = this.getDragTarget(e);
      if (dragTarget) {
        if (dragTarget.classList.contains('zombie') && !dragEl.classList.contains('resolve')) {
          Battle.resolveAttack(dragEl, dragTarget);
        }
      } else {
        this.resetDraggedElement(dragEl);
      }
      dragMode = false;
      dragEl = null;
    }
  },

  resetDraggedElement(el) {
    el.style.left = initialStyleLeft;
    el.style.top = initialStyleTop;
    el.classList.remove('grabbed');
  },

  getDragTarget(e) {

    let targetCandidateFound;
    let mouseX = e.clientX;
    let mouseY = e.clientY;

    let targetCards = document.querySelectorAll('.card.zombie.fight');

    targetCards.forEach(candidate => {

      let viewportOffset = candidate.getBoundingClientRect();
      candidate.classList.remove('active');

      if (mouseX >= viewportOffset.left &&
          mouseX <= viewportOffset.right &&
          mouseY >= viewportOffset.top &&
          mouseY <= viewportOffset.bottom) {
          
          targetCandidateFound = candidate;
      }

    });

    return targetCandidateFound;

  },
  
  handleClick: function(ev) {

    const target = ev.target;
    const clickAction = target.closest('#actions');
    const mapClick = target.closest('#maximap');
    const leftMouseButton = (ev.button === 0);

    if (leftMouseButton) {
      if (clickAction) {
        Audio.sfx('click');
        ev.preventDefault();
        ev.stopPropagation();
        const action = target.closest('li');
        if (action.classList.contains('inventory')) {
          document.getElementById('inventory').classList.toggle('active');
          document.getElementById('craft').classList.remove('active');
        } else if (action.classList.contains('craft')) {
          document.getElementById('craft').classList.toggle('active');
          document.getElementById('inventory').classList.remove('active');
        } else if (action.classList.contains('settings')) {
          document.getElementById('card-console').classList.toggle('out');
        } else if (action.classList.contains('map')) {
          this.hideUI();
        }
      }
  
      if (mapClick) {
        document.getElementById('craft').classList.remove('active');
        document.getElementById('inventory').classList.remove('active');
        this.showUI();
      }
    }
  },

  hideUI: function() {
    document.getElementById('craft').classList.remove('active');
    document.getElementById('inventory').classList.remove('active');
    document.getElementById('properties').classList.remove('active');
    document.getElementById('actions').classList.remove('active');
    document.getElementById('cards').classList.remove('active');
    document.getElementById('card-console').classList.add('out');
  },

  showUI: function() {
    document.getElementById('properties').classList.add('active');
    document.getElementById('actions').classList.add('active');
    document.getElementById('cards').classList.add('active');
  },

  resizeViewport: function() {
    const viewWidth = window.innerWidth,
          viewHeight = window.innerHeight;
    let scaleFactor;

    /*if (viewWidth / viewHeight < 1.78) {
      scaleFactor = viewWidth / 2135;
    } else {
      scaleFactor = viewHeight / 1200;
    }*/
    scaleFactor = viewHeight / 1200;
    viewport.style.transform = 'scale3d('+scaleFactor+','+scaleFactor+','+scaleFactor+') translate3d(-50%,0,0)';
  },

  hourlyTasks: function(hour) {

    this.updateDayNightLayers(hour);

  },

  dailyTasks: function(days) {
    if (days >= 9) {
      Player.playerDead();
    }
  },

  updateDayNightLayers: function(hour) {

    var shortShadowPos = 0;
    var shortShadowSize = 0;
    var longShadowPos = 0;
    var longShadowSize = 0;

    var stunde = Math.floor(hour);

    document.querySelector('.time').innerHTML = stunde + ":00";

    if (hour >= 5 && hour <= 19) {        
      let timeTillNoon = (12 - hour) * -1;
      if (hour >= 5 && hour <= 9) {
        for (const light of morningLight) {
          light.style.opacity = 0.9 - (hour - 5) / 4;
        }
      } else if (hour >= 16 && hour <= 19) {
        for (const light of eveningLight) {
          light.style.opacity = (hour - 16) / 3;
        }
      }
      shortShadowPos = Math.round(timeTillNoon * 0.7);
      shortShadowSize = Math.round(timeTillNoon * 1);
      longShadowPos = Math.round(timeTillNoon * 4);
      longShadowSize = Math.round(timeTillNoon * 1.3);
      mapHigh.style.filter = "drop-shadow(" + shortShadowPos + "px " + Math.abs(shortShadowPos / 2) + "px " + Math.abs(shortShadowSize) + "px rgba(0, 0, 0, 0.5)) drop-shadow(" + longShadowPos + "px " + Math.abs(longShadowPos / 2) + "px " + Math.abs(longShadowSize) + "px rgba(0, 0, 0, 0.4))";        
    }
    if (hour >= 20 && hour <= 22) {
      for (const light of nightLight) {
        light.style.opacity = 1 - Math.round((23 - hour) / 2 * 10) / 10 + 0.3; // / 2 -> completely dark
      }
      for (const light of nightCover) {
        light.style.opacity = 1 - Math.round((21 - hour) / 2 * 10) / 10; // / 2 -> completely dark
      }
    } else if (hour >= 4 && hour <= 7) {
      for (const light of nightLight) {
        light.style.opacity = 0.9 - Math.round((hour - 4) / 3 * 10) / 10;
      }
      for (const light of nightCover) {
        light.style.opacity = 1 - Math.round((hour - 4) / 3 * 10) / 10;
      }
    }
    if (hour === 23) {
      mapHigh.style.filter = "";
      for (const light of morningLight) {
        light.style.opacity = 0;
      }
      for (const light of eveningLight) {
        light.style.opacity = 0;
      }
      for (const light of nightLight) {
        light.style.opacity = 0.8;
      }
      for (const light of nightCover) {
        light.style.opacity = 1;
      }
    }
  }
}
