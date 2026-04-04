import Battle from './battle.js';
import Items from './items.js';
import Tutorial from './tutorial.js';

const battleCardsContainer = document.getElementById('battle-cards');
const defensiveCardsContainer = document.querySelector('#defensive-cards');

let newPosX = 0,
  newPosY = 0,
  startPosX = 0,
  startPosY = 0,
  initialStyleLeft = 0,
  initialStyleTop = 0;
let dragMode = false;
let dragEl = null;
let topIndex = 1;

export default {
  init: function () {
    document.body.addEventListener('mouseover', this.mouseOver);
    document.body.addEventListener('pointerdown', this.mouseDown);
    document.body.addEventListener('pointermove', this.mouseMove.bind(this));
    document.body.addEventListener('pointerup', this.mouseUp.bind(this));
    document.addEventListener('uiDragTestEvent', this.handleUiTestDragEvent.bind(this));
  },

  handleBattleCardsClick: function (ev, target) {
    ev.preventDefault();
    ev.stopPropagation();
    const endTurn = target.closest('.end-turn');
    if (endTurn) {
      Battle.endTurn();
    }
    const startTutorial = target.closest('.start-tutorial');
    if (startTutorial) {
      Tutorial.triggerBattleTutorial();
    }
  },

  mouseOver: function (ev) {
    const target = ev.target;
    const battleCard = target.closest ? target.closest('div.battle-card') : null,
      item = battleCard?.dataset.item;
    if (dragMode === false && battleCard) {
      battleCardsContainer.querySelector('p.item-info').innerHTML = Items.getItemInfoMarkup(
        item,
        true
      );
    } else {
      battleCardsContainer.querySelector('p.item-info').innerHTML = '';
    }
  },

  mouseDown: function (ev) {
    let target = ev.target;
    const leftMouseButton = ev.button === 0;

    if (target && leftMouseButton) {
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

      // TODO: move almanac drag handling to almanac.js
      if (dragMode === false && target.closest('#almanac') && target.classList.contains('title')) {
        dragMode = true;

        dragEl = target.closest('#almanac');
        dragEl.classList.add('grabbed');

        startPosX = dragEl.clientX;
        startPosY = dragEl.clientY;

        initialStyleLeft = dragEl.style.left;
        initialStyleTop = dragEl.style.top;
      }
    }
  },

  mouseMove: function (e) {
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
        dragEl.style.top = dragEl.offsetTop - newPosY + 'px';
        dragEl.style.left = dragEl.offsetLeft - newPosX + 'px';
        let dragTarget = this.getDragTarget(e);
        if (dragTarget) {
          dragTarget.classList.add('active');
        }
        // remove item info when card is dragged
        battleCardsContainer.querySelector('p.item-info').innerHTML = '';
      }
    }
  },

  mouseUp: function (e) {
    if (dragMode) {
      let dragTarget = this.getDragTarget(e);
      this.resolveMouseUp(dragTarget, dragEl);
      dragMode = false;
      dragEl = null;
    }
  },

  handleUiTestDragEvent: function (e) {
    const { dragTarget, dragItem, dragIndex } = e.detail;
    // Handle the test drag event directly
    const dragTargetEl = document.querySelector(`[id="${dragTarget}"]`);
    const dragEl = document.querySelector(
      `#battle-cards [data-item="${dragItem}"][data-index="${dragIndex}"]`
    );
    if (dragTargetEl && dragEl) {
      this.resolveMouseUp(dragTargetEl, dragEl);
    }
  },

  async resolveMouseUp(dragTarget, dragEl) {
    if (dragTarget && dragEl) {
      if (dragTarget.classList.contains('zombie') && !dragEl.classList.contains('resolve')) {
        const itemName = dragEl.dataset.item;
        if (itemName === 'improvised-whip') {
          await Battle.resolveMultiAttack(dragEl, dragTarget);
        } else {
          Battle.resolveSingleAttack(dragEl, dragTarget);
        }
      }
    } else if (dragEl?.id === 'almanac') {
      // TODO: move almanac drag release handling to almanac.js
      dragEl.classList.remove('grabbed');
      dragEl.classList.add('repos');
    } else if (dragEl) {
      this.resetDraggedElement(dragEl);
    }
  },

  resetDraggedElement: function (el) {
    el.style.left = initialStyleLeft;
    el.style.top = initialStyleTop;
    el.classList.remove('grabbed');
  },

  getDragElement: function () {
    return dragEl;
  },

  enterUIBattleMode() {
    // Prepare UI for battle
    document.getElementById('inventory').classList.remove('active');
    document.getElementById('craft').classList.remove('active');
    document.getElementById('character').classList.remove('active');
    document.getElementById('cards').classList.add('battle-mode');
    document.querySelector('#cards .cards-blocker').classList.remove('is--hidden');
    defensiveCardsContainer.classList.remove('heavy-shake');
    defensiveCardsContainer.classList.remove('is--hidden');

    // Time further changes to allow CSS transitions
    window.setTimeout(() => {
      document.querySelector('#cards .cards-blocker').classList.add('active');
    }, 100);

    window.setTimeout(() => {
      document.getElementById('properties').classList.remove('active');
      document.getElementById('actions').classList.remove('active');
      document.querySelector('#cards .cards-blocker').classList.add('active');
      defensiveCardsContainer.classList.add('in-battle');
    }, 600);
  },

  showBattleMessage: function (message, delay) {
    document.querySelector('#battle-message').innerHTML = message;
    document.querySelector('#battle-message').classList.add('active');
    window.setTimeout(() => {
      document.querySelector('#battle-message').classList.remove('active');
    }, delay);
  },

  showBattleStats: function (stat, type) {
    const battleStats = document.querySelector('#battle-stats span.' + type);
    if (type === 'image') {
      battleStats.innerHTML = '<img width="60" height="auto" src="./img/items/' + stat + '.PNG">';
    } else {
      battleStats.innerHTML = stat;
    }
    battleStats.classList.add('active');
    window.setTimeout(
      battleStats => {
        battleStats.classList.remove('active');
      },
      500,
      battleStats
    );
  },

  getDragTarget: function (e) {
    let targetCandidateFound;
    let mouseX = e.clientX;
    let mouseY = e.clientY;

    let targetCards = document.querySelectorAll('.card.zombie.fight');

    targetCards.forEach(candidate => {
      let viewportOffset = candidate.getBoundingClientRect();
      candidate.classList.remove('active');

      if (
        mouseX >= viewportOffset.left &&
        mouseX <= viewportOffset.right &&
        mouseY >= viewportOffset.top &&
        mouseY <= viewportOffset.bottom
      ) {
        targetCandidateFound = candidate;
      }
    });

    return targetCandidateFound;
  },
};
