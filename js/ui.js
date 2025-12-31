import Props from './props.js';
import Battle from './battle.js';
import Audio from './audio.js';
import Player from './player.js';
import Character from './character.js';
import Almanac from './almanac.js';
import Items from './items.js';
import Events, { EVENTS } from './events.js';
import TimingUtils from './utils/timing-utils.js';

const viewport = document.getElementById('viewport');
const mapBorder = document.getElementById('map-border');
const mapHigh = document.querySelector('.map-high img');
const morningLight = document.querySelectorAll('.morning-light');
const eveningLight = document.querySelectorAll('.evening-light');
const nightLight = document.querySelectorAll('.night-light');
const nightCover = document.querySelectorAll('.night-ui-cover');

const battleCardsContainer = document.getElementById('battle-cards');
const inventoryContainer = document.getElementById('inventory');
const craftContainer = document.getElementById('craft');

let newPosX = 0,
  newPosY = 0,
  startPosX = 0,
  startPosY = 0,
  initialStyleLeft = 0,
  initialStyleTop = 0;
let dragMode = false;
let dragEl = null;
let topIndex = 1;
let zoom = 1;
let maxZoom = 1.9;

export default {
  init: function () {
    window.addEventListener('resize', this.resizeViewport.bind(this));
    document.body.addEventListener('mousedown', this.handleClick.bind(this));
    document.body.addEventListener('mouseover', this.mouseOver);
    document.body.addEventListener('pointerdown', this.mouseDown);
    document.body.addEventListener('pointermove', this.mouseMove.bind(this));
    document.body.addEventListener('pointerup', this.mouseUp.bind(this));
    document.body.addEventListener('keydown', this.handleKeydown.bind(this));
    document.body.addEventListener('wheel', this.handleMouseWheel.bind(this));

    document.addEventListener('uiDragTestEvent', this.handleUiTestDragEvent.bind(this));

    document.body.addEventListener('contextmenu', ev => {
      if (Props.getGameProp('local') === false) {
        ev.preventDefault();
      }
    });

    Events.on(
      EVENTS.GAME_PROP_CHANGED,
      ({ prop, value }) => {
        if (prop === 'timeIsUnity') {
          this.handleTimeChange(value);
        }
      },
      { prop: 'timeIsUnity', value: Props.getGameProp('timeIsUnity') }
    );
  },

  handleTimeChange: function (time) {
    const hour = time.todayHours;
    const days = time.gameDays;
    const ticksPerHour = Props.getGameProp('timeConfig').ticksPerHour;

    // Update game time UI elements
    document.getElementById('gametime-days').textContent = days;
    document.getElementById('gametime-hours').textContent = time.todayTime;

    // Check if it's a new hour (when gameTick is divisible by ticksPerHour)
    if (time.gameTick % ticksPerHour === 0) {
      this.updateDayNightLayers(hour);
      this.switchDayNight(hour);
      this.showNewDay(hour);
    }

    // Check if it's a new day (when gameHours is divisible by 24)
    if (time.gameHours % 24 === 0 && time.gameTick % ticksPerHour === 0) {
      this.dailyTasks(days);
    }
  },

  handleKeydown: function (ev) {
    const actionsPanel = document.getElementById('actions');
    const actionsPanelActive = actionsPanel.classList.contains('active');
    if (!Props.getGameProp('battle') && ev.key) {
      if (ev.key.toLowerCase() === 'i' && actionsPanelActive) {
        actionsPanel
          .querySelector('li.inventory')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      } else if (ev.key.toLowerCase() === 'c' && actionsPanelActive) {
        actionsPanel
          .querySelector('li.craft')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      } else if (ev.key.toLowerCase() === 'm') {
        if (actionsPanelActive) {
          actionsPanel
            .querySelector('li.map')
            ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
        } else {
          this.handleMapClick();
        }
      } else if (ev.key.toLowerCase() === 'e') {
        const settingsAction = actionsPanel.querySelector('li.settings');
        // make sure editor can be opened even if actions panel is hidden
        if (settingsAction) {
          settingsAction.dispatchEvent(new Event('mousedown', { bubbles: true }));
        } else {
          document.getElementById('card-console').classList.toggle('out');
        }
      } else if (ev.key.toLowerCase() === 'q' && actionsPanelActive) {
        actionsPanel
          .querySelector('li.quit')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      } else if (ev.key.toLowerCase() === 'f' && actionsPanelActive) {
        actionsPanel
          .querySelector('li.fullscreen')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      } else if ((ev.key.toLowerCase() === 'p' || ev.code === 'Space') && actionsPanelActive) {
        actionsPanel
          .querySelector('li.mixed span.pause')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      }
    }
  },

  handleMouseWheel: function (ev) {
    this.zoomMap(ev.deltaY);
  },

  zoomMap: function (deltaY, limitZoom) {
    if (limitZoom) {
      if (zoom > limitZoom) zoom = limitZoom;
      maxZoom = limitZoom;
    } else if (deltaY > 0) {
      zoom > 1 ? (zoom -= 0.1) : false;
    } else if (zoom < maxZoom) {
      zoom += 0.1;
    }
    viewport.querySelector('#maximap .inner').style.transform = 'scale(' + zoom + ')';
  },

  resetZoom: function () {
    maxZoom = 1.9;
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

  resolveMouseUp: function (dragTarget, dragEl) {
    if (dragTarget && dragEl) {
      if (dragTarget.classList.contains('zombie') && !dragEl.classList.contains('resolve')) {
        const itemName = dragEl.dataset.item;
        const item = Items.getItemByName(itemName);
        if (item.name === 'improvised-whip') {
          Battle.resolveMultiAttack(dragEl, dragTarget);
        } else {
          Battle.resolveAttack(dragEl, dragTarget, false);
        }
      }
    } else if (dragEl?.id === 'almanac') {
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
    console.log(dragEl.dataset.item, dragEl.dataset.index);
    return dragEl;
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

  // just finds a class among a predefined set
  getActionType: function (element) {
    const classes = ['inventory', 'craft', 'mixed', 'settings', 'map', 'quit', 'fullscreen'];
    return classes.find(cls => element.classList.contains(cls));
  },

  handleClick: function (ev) {
    const target = ev.target;
    const clickAction = target.closest('#actions');
    const clickProperty = target.closest('#properties');
    const clickBattleCards = target.closest('#battle-cards');
    const mapClick = target.closest('#maximap');
    const leftMouseButton = ev.button === 0 || !ev.button; // 2nd part also takes keyboard shortcuts into account
    const rightMouseButton = ev.button === 2;

    if (clickAction && leftMouseButton && !Props.getGameProp('battle')) {
      Audio.sfx('click');
      ev.preventDefault();
      ev.stopPropagation();
      const action = target.closest('li');
      if (action) {
        const actionType = this.getActionType(action);
        switch (actionType) {
          case 'inventory':
            this.toggleInventory();
            break;
          case 'craft':
            this.toggleCrafting();
            break;
          case 'mixed':
            if (target.classList.contains('pause')) {
              if (Props.getGameProp('gamePaused')) {
                Props.pauseGame(false);
                target.innerHTML = '<u>P</u>ause Game';
                target.classList.remove('active');
              } else {
                Props.pauseGame(true);
                target.innerHTML = 'Game <u>P</u>aused';
                target.classList.add('active');
              }
            }
            break;
          case 'settings':
            document.getElementById('card-console').classList.toggle('out');
            break;
          case 'map':
            this.hideUI();
            break;
          case 'quit':
            this.hideUI();
            this.quitConfirmation();
            break;
          case 'fullscreen': {
            // enter/exit fullscreen mode
            const fullscreenActive = document.fullscreenElement;
            if (document.fullscreenEnabled) {
              if (!fullscreenActive) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }
            break;
          }
        }
      }
    } else if (clickBattleCards && leftMouseButton && Props.getGameProp('battle')) {
      ev.preventDefault();
      ev.stopPropagation();
      const endTurn = target.closest('.end-turn');
      if (endTurn) {
        Battle.endTurn();
      }
    } else if (clickProperty && rightMouseButton) {
      const property = target.closest('li');
      if (property?.classList.contains('health')) {
        Almanac.showPage('health', 'content', property, document.getElementById('properties'));
      } else if (property?.classList.contains('food')) {
        Almanac.showPage('food', 'content', property, document.getElementById('properties'));
      } else if (property?.classList.contains('thirst')) {
        Almanac.showPage('thirst', 'content', property, document.getElementById('properties'));
      } else if (property?.classList.contains('energy')) {
        Almanac.showPage('energy', 'content', property, document.getElementById('properties'));
      }
    }

    if (mapClick) {
      this.handleMapClick();
    }

    if (target && target.classList.contains('card-tutorial-confirm')) {
      Audio.sfx('shuffle-paper');
      document.getElementById('tutorial-fights').classList.add('is--hidden');
      document.getElementById('tutorial-beginning').classList.add('is--hidden');
    }
  },

  toggleInventory: function () {
    const inventoryActive = inventoryContainer.classList.contains('active');
    if (inventoryActive) {
      this.closeInventory();
    } else {
      this.openInventory();
    }
  },

  openInventory: function () {
    inventoryContainer.classList.add('active');
    this.closeCrafting();
  },

  closeInventory: function () {
    inventoryContainer.classList.remove('active');
    if (Props.getGameProp('feedingCompanion')) {
      document.getElementById('inventory').classList.remove('feeding-companion');
      Character.toggleCompanionFeedingState(false);
      Props.setGameProp('feedingCompanion', false);
      Items.fillInventorySlots();
    }
  },

  closeCrafting: function () {
    craftContainer.classList.remove('active');
  },

  showFeedingInventory: function () {
    Props.setGameProp('feedingCompanion', true);
    Items.fillInventorySlots();
    this.openInventory();
    document.getElementById('inventory').classList.add('feeding-companion');
  },

  toggleCrafting: function (forceOpen) {
    const craftingActive = craftContainer.classList.contains('active');
    if (craftingActive && !forceOpen) {
      this.closeCrafting();
    } else {
      craftContainer.classList.add('active');
      this.closeInventory();
    }
  },

  quitConfirmation: async function () {
    let startScreen = document.getElementById('startscreen');
    startScreen.classList.remove('is--hidden');
    startScreen.style.opacity = 0;
    await TimingUtils.wait(300);
    startScreen.querySelector('.screen__1').classList.add('is--hidden');
    startScreen.querySelector('.screen__2').classList.add('is--hidden');
    startScreen.querySelector('.screen__3').classList.add('is--hidden');
    startScreen.querySelector('.screen__dead').classList.add('is--hidden');
    startScreen.querySelector('.screen__win').classList.add('is--hidden');
    startScreen.querySelector('.screen__quit').classList.remove('is--hidden');
    startScreen.style.opacity = 1;
  },

  handleMapClick: function () {
    this.closeCrafting();
    this.closeInventory();
    this.showUI();
  },

  hideUI: function () {
    this.closeCrafting();
    this.closeInventory();
    Almanac.close(true);
    document.getElementById('properties').classList.remove('active');
    document.getElementById('character').classList.remove('active');
    document.getElementById('actions').classList.remove('active');
    document.getElementById('cards').classList.remove('active');
    document.getElementById('almanac').classList.add('out');
    document.getElementById('card-console').classList.add('out');
  },

  showUI: function () {
    document.getElementById('properties').classList.add('active');
    document.getElementById('character').classList.add('active');
    document.getElementById('actions').classList.add('active');
    document.getElementById('cards').classList.add('active');
  },

  showMapBorder: function () {
    mapBorder.classList.add('in-front');
  },

  resizeViewport: function () {
    const viewWidth = window.innerWidth,
      viewHeight = window.innerHeight;

    if (viewWidth / viewHeight < 1.73) {
      Props.setGameProp('scaleFactor', viewWidth / 2135);
      Props.setGameProp('viewMode', 'vertical');
      mapBorder.style.transform =
        'scale3d(' +
        Props.getGameProp('scaleFactor') * 1.173 +
        ',' +
        Props.getGameProp('scaleFactor') * 1.173 +
        ', 1) translate3d(-5%, -50% , 0)';
    } else {
      Props.setGameProp('scaleFactor', viewHeight / 1200);
      Props.setGameProp('viewMode', 'horizontal');
      mapBorder.removeAttribute('style');
    }
    mapBorder.classList.remove('horizontal', 'vertical');
    mapBorder.classList.add(Props.getGameProp('viewMode'));
    viewport.style.transform =
      'scale3d(' +
      Props.getGameProp('scaleFactor') +
      ',' +
      Props.getGameProp('scaleFactor') +
      ', 1) translate3d(-50%, -50% , 0)';
    this.handleFullscreenChange();
  },

  handleFullscreenChange: function () {
    if (document.fullscreenElement) {
      document.querySelector('#actions .fullscreen .fullscreen--on').classList.add('is--hidden');
      document
        .querySelector('#actions .fullscreen .fullscreen--off')
        .classList.remove('is--hidden');
    } else {
      document.querySelector('#actions .fullscreen .fullscreen--on').classList.remove('is--hidden');
      document.querySelector('#actions .fullscreen .fullscreen--off').classList.add('is--hidden');
    }
  },

  hourlyTasks: function (hour) {
    this.updateDayNightLayers(hour);
    this.switchDayNight(hour);
    this.showNewDay(hour);
  },

  switchDayNight: function (hour) {
    if (hour === 21) {
      // switch to night time
      document.querySelector('#actions li.mixed').classList.remove('day');
      document.querySelector('#actions li.mixed').classList.add('night');
      Props.setGameProp('timeMode', 'night');
    }
    if (hour === 5) {
      // switch to day time
      document.querySelector('#actions li.mixed').classList.remove('night');
      document.querySelector('#actions li.mixed').classList.add('day');
      Props.setGameProp('timeMode', 'day');
    }
  },

  dailyTasks: function (days) {
    if (days > 9) {
      Player.playerDead();
    }
  },

  showNewDay: async function (hour, force) {
    const time = Props.getGameProp('timeIsUnity');
    if (force || (time.gameDays > Props.getGameProp('startDay') && hour === 7)) {
      const dayTeaser = document.getElementById('day-teaser');
      if (dayTeaser) {
        dayTeaser.querySelector('.content').innerHTML = 'Day <span>' + time.gameDays + '</span>';
        dayTeaser.classList.add('open');
        dayTeaser.style.zIndex = '60';
        await TimingUtils.wait(2500);
        dayTeaser.querySelector('.content').style.transitionDelay = '0';
        dayTeaser.classList.remove('open');
        await TimingUtils.wait(1000);
        dayTeaser.removeAttribute('style');
      }
    }
  },

  updateDayNightLayers: function (hour) {
    var shortShadowPos = 0;
    var shortShadowSize = 0;
    var longShadowPos = 0;
    var longShadowSize = 0;

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
      mapHigh.style.filter =
        'drop-shadow(' +
        shortShadowPos +
        'px ' +
        Math.abs(shortShadowPos / 2) +
        'px ' +
        Math.abs(shortShadowSize) +
        'px rgba(0, 0, 0, 0.5)) drop-shadow(' +
        longShadowPos +
        'px ' +
        Math.abs(longShadowPos / 2) +
        'px ' +
        Math.abs(longShadowSize) +
        'px rgba(0, 0, 0, 0.4))';
    }
    if (hour >= 20 && hour <= 22) {
      for (const light of nightLight) {
        light.style.opacity = 1 - Math.round(((23 - hour) / 2) * 10) / 10 + 0.3; // / 2 -> completely dark
      }
      for (const light of nightCover) {
        light.style.opacity = 1 - Math.round(((21 - hour) / 2) * 10) / 10; // / 2 -> completely dark
      }
    } else if (hour >= 4 && hour <= 7) {
      for (const light of nightLight) {
        light.style.opacity = 0.9 - Math.round(((hour - 4) / 3) * 10) / 10;
      }
      for (const light of nightCover) {
        light.style.opacity = 1 - Math.round(((hour - 4) / 3) * 10) / 10;
      }
    }
    if (hour === 23) {
      this.triggerNight();
    }
  },

  triggerNight: function () {
    mapHigh.style.filter = '';
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
  },
};
