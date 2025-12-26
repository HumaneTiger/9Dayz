import Events, { EVENTS } from './events.js';
import Props from './props.js';
import Cards from './cards.js';
import Map from './map.js';
import Battle from './battle.js';
import Ui from './ui.js';

const allPaths = Props.getAllPaths();
const playerProps = Props.getPlayerProps();
const playerPosition = Props.getGameProp('playerPosition');

let player = document.getElementById('player');
let moveLocked = false;
let moving = false;

export default {
  init: function () {
    // Register event listeners
    Events.on(EVENTS.PLAYER_PROP_CHANGED, this.updatePropUI.bind(this));

    this.initPlayer();
    this.initMovement();
  },

  /**
   * Update UI in response to player property changes (event handler)
   * All UI updates for property changes happen here
   */
  updatePropUI: function ({ prop, change, newValue }) {
    // Update numeric value
    const propMeterValue = document.getElementById(`${prop}-meter`);
    if (propMeterValue) {
      propMeterValue.textContent = newValue;
    }
    // Update property meter
    const propMeter = document.querySelector(`#properties li.${prop} span.meter:not(.preview)`);
    if (propMeter) {
      propMeter.style.width = newValue > 9 ? newValue + '%' : '9%';
      propMeter.parentNode.classList.remove('low');
      propMeter.parentNode.classList.remove('very-low');

      if (newValue < 10) {
        propMeter.parentNode.classList.add('very-low');
      } else if (newValue < 33) {
        propMeter.parentNode.classList.add('low');
      }

      if (prop === 'health' && change < 0) {
        document.querySelector('#properties li.health').classList.add('heavy-shake');
        window.setTimeout(() => {
          document.querySelector('#properties li.health').classList.remove('heavy-shake');
        }, 200);
      }
    }

    // Update damage overlay for health changes
    if (prop === 'health') {
      this.updateDamageOverlay(newValue);
    }
  },

  updateDamageOverlay: function (health) {
    if (health < 33) {
      document.getElementById('damage-cover').style.opacity = (100 - health * 3.3) / 100;
    } else {
      document.getElementById('damage-cover').style.opacity = 0;
    }
  },

  previewProps: function (prop, change) {
    const previewMeter = document.querySelector(
      '#properties li.' + prop + ' span.meter:not(.preview)'
    );
    if (previewMeter) {
      if (change > 0) {
        playerProps[prop] + change > 100 ? (change = 100 - playerProps[prop]) : null;
        previewMeter.style.paddingRight = change + '%';
      } else if (change < 0) {
        if (previewMeter) {
          previewMeter.style.paddingRight =
            (playerProps[prop] + change > 9 ? Math.abs(change) : 0) + '%';
          previewMeter.style.width =
            (playerProps[prop] + change > 9 ? playerProps[prop] + change : 9) + '%';
        }
      }
      if (playerProps[prop] + change < 10) {
        previewMeter.parentNode.classList.add('very-low');
      } else if (playerProps[prop] + change < 33) {
        previewMeter.parentNode.classList.add('low');
      }
    }
  },

  resetPreviewProps: function () {
    document.querySelector('#properties li.food').classList.remove('transfer');
    document.querySelector('#properties li.thirst').classList.remove('transfer');
    document.querySelector('#properties li.energy').classList.remove('transfer');
    document.querySelector('#properties li.health').classList.remove('transfer');
    document.querySelector('#properties li.food span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.thirst span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.energy span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.health span.meter').style.paddingRight = '0'; // do not remove, or meter will stick out to the right
    Props.changePlayerProp('food', 0);
    Props.changePlayerProp('thirst', 0);
    Props.changePlayerProp('energy', 0);
    Props.changePlayerProp('health', 0);
  },

  checkForDamage: function () {
    this.updateDamageOverlay(this.getProp('health'));
  },

  checkForDeath: function (secondWind) {
    if (this.getProp('health') <= 0) {
      // 50:50 chance
      if (!secondWind || Math.random() >= 0.5) {
        this.playerDead();
        return true;
      }
    }
    return false;
  },

  playerDead: function () {
    let startScreen = document.getElementById('startscreen');
    startScreen.classList.remove('is--hidden');
    startScreen.style.opacity = 0;
    window.setTimeout(() => {
      startScreen.querySelector('.screen__1').classList.add('is--hidden');
      startScreen.querySelector('.screen__2').classList.add('is--hidden');
      startScreen.querySelector('.screen__3').classList.add('is--hidden');
      startScreen.querySelector('.screen__win').classList.add('is--hidden');
      startScreen.querySelector('.screen__dead').classList.remove('is--hidden');
      startScreen.style.opacity = 1;
    }, 100);
  },

  checkForWin: function () {
    let startScreen = document.getElementById('startscreen');
    startScreen.classList.remove('is--hidden');
    startScreen.style.opacity = 0;
    window.setTimeout(() => {
      startScreen.querySelector('.screen__1').classList.add('is--hidden');
      startScreen.querySelector('.screen__2').classList.add('is--hidden');
      startScreen.querySelector('.screen__3').classList.add('is--hidden');
      startScreen.querySelector('.screen__dead').classList.add('is--hidden');
      startScreen.querySelector('.screen__win').classList.remove('is--hidden');
      startScreen.style.opacity = 1;
    }, 300);
  },

  initPlayer: function () {
    Ui.showUI();
    this.movePlayerTo(playerPosition.x, playerPosition.y);
    if (playerPosition.y < 20) {
      Map.moveMapYTo(20);
    } else if (playerPosition.y > 40) {
      Map.moveMapYTo(40);
    } else {
      Map.moveMapYTo(playerPosition.y);
    }
    Map.mapUncoverAt(playerPosition.x, playerPosition.y);
    window.setTimeout(() => {
      Cards.enableActions();
    }, 0);
  },

  updatePlayer: function (noPenalty) {
    Ui.showUI();
    this.movePlayerTo(playerPosition.x, playerPosition.y);

    window.setTimeout(() => {
      const objectsHere = Props.getObjectsAt(playerPosition.x, playerPosition.y);
      this.findAndHandleObjects();
      Cards.enableActions();
      if (objectsHere?.some(obj => obj.group === 'zombie' && !obj.dead)) {
        window.setTimeout(() => {
          Battle.startBattle(true);
        }, 800);
      }
    }, 0);

    if (!noPenalty) {
      Props.changePlayerProp('energy', -1);
      Props.changePlayerProp('thirst', -2);
      Props.changePlayerProp('food', -1);
    }

    if (Props.getGameProp('character') === 'snackivore') {
      Props.changePlayerProp('energy', -1);
      Props.changePlayerProp('thirst', -1);
      Props.changePlayerProp('food', -1);
    }

    if (this.getProp('food') <= 0) Props.changePlayerProp('health', -5);
    if (this.getProp('thirst') <= 0) Props.changePlayerProp('health', -5);
    if (this.getProp('energy') <= 0) Props.changePlayerProp('energy', -5);

    this.checkForDeath(true);
  },

  findAndHandleObjects: function () {
    const allFoundObjectIds = this.findObjects(playerPosition.x, playerPosition.y);
    this.handleFoundObjectIds(allFoundObjectIds);
  },

  movePlayerTo: function (x, y) {
    /* handle horizontal position */
    if (x <= 12) {
      Map.moveMapXTo(12 - x);
      player.style.left = '550px';
    } else if (x >= 29) {
      Map.moveMapXTo(29 - x);
      player.style.left = '1304px';
    } else {
      player.style.left = Math.round(x * 44.4 + 17) + 'px'; // default horizontal pos before zoom
    }
    /* handle vertical position */
    if (y < 20) {
      player.style.top = 885 - Math.round((20 - y) * 44.4) + 'px';
    } else if (y > 40) {
      player.style.top = 885 + Math.round((y - 40) * 44.4) + 'px';
    } else {
      player.style.top = '885px';
    }
    if (y < 16) {
      Ui.zoomMap(0, 1.1);
    } else {
      Ui.resetZoom();
    }
    if (playerPosition.y >= 20 && playerPosition.y <= 40) {
      Map.moveMapYTo(y);
    }
    if (x % 4 === 0 || y % 4 === 0) {
      Map.mapUncoverAt(x, y);
    }
    document.getElementById('player-hint').style.left = player.style.left;
    document.getElementById('player-hint').style.top = player.style.top;
  },

  lockMovement: function (moveable) {
    moveLocked = moveable;
  },

  initMovement: function () {
    document.body.addEventListener('keydown', this.handleKeydown.bind(this));
    document
      .getElementById('touchcontrols')
      .addEventListener('pointerdown', this.handlePointerdown.bind(this));
  },

  handleKeydown: function (ev) {
    const posXBefore = playerPosition.x,
      posYBefore = playerPosition.y;

    if (!moving && !moveLocked && !Props.getGameProp('gamePaused')) {
      if (ev.key && (ev.key.toLowerCase() === 'w' || ev.key === 'ArrowUp')) {
        ev.preventDefault();
        if (allPaths[playerPosition.x][playerPosition.y - 1]) {
          playerPosition.y -= 1;
        } else if (
          allPaths[playerPosition.x - 1][playerPosition.y - 1] &&
          !allPaths[playerPosition.x - 1][playerPosition.y]
        ) {
          playerPosition.x -= 1;
          playerPosition.y -= 1;
        } else if (
          allPaths[playerPosition.x + 1][playerPosition.y - 1] &&
          !allPaths[playerPosition.x + 1][playerPosition.y]
        ) {
          playerPosition.x += 1;
          playerPosition.y -= 1;
        }
      }
      if (ev.key && (ev.key.toLowerCase() === 's' || ev.key === 'ArrowDown')) {
        ev.preventDefault();
        if (allPaths[playerPosition.x][playerPosition.y + 1]) {
          playerPosition.y += 1;
        } else if (
          allPaths[playerPosition.x - 1][playerPosition.y + 1] &&
          !allPaths[playerPosition.x - 1][playerPosition.y]
        ) {
          playerPosition.x -= 1;
          playerPosition.y += 1;
        } else if (
          allPaths[playerPosition.x + 1][playerPosition.y + 1] &&
          !allPaths[playerPosition.x + 1][playerPosition.y]
        ) {
          playerPosition.x += 1;
          playerPosition.y += 1;
        }
        // bloody overrule sidecases caused by diagonals, else is important here!
        else if (playerPosition.x === 6 && playerPosition.y === 38) {
          playerPosition.x += 1;
          playerPosition.y += 1;
        }
      }
      if (ev.key && (ev.key.toLowerCase() === 'a' || ev.key === 'ArrowLeft')) {
        ev.preventDefault();
        if (allPaths[playerPosition.x - 1][playerPosition.y]) {
          playerPosition.x -= 1;
        } else if (
          allPaths[playerPosition.x - 1][playerPosition.y - 1] &&
          !allPaths[playerPosition.x - 1][playerPosition.y]
        ) {
          playerPosition.x -= 1;
          playerPosition.y -= 1;
        } else if (
          allPaths[playerPosition.x - 1][playerPosition.y + 1] &&
          !allPaths[playerPosition.x + 1][playerPosition.y]
        ) {
          playerPosition.x -= 1;
          playerPosition.y += 1;
        }
      }
      if (ev.key && (ev.key.toLowerCase() === 'd' || ev.key === 'ArrowRight')) {
        ev.preventDefault();
        if (allPaths[playerPosition.x + 1][playerPosition.y]) {
          playerPosition.x += 1;
        } else if (
          allPaths[playerPosition.x + 1][playerPosition.y - 1] &&
          !allPaths[playerPosition.x + 1][playerPosition.y]
        ) {
          playerPosition.x += 1;
          playerPosition.y -= 1;
        } else if (
          allPaths[playerPosition.x + 1][playerPosition.y + 1] &&
          !allPaths[playerPosition.x + 1][playerPosition.y]
        ) {
          playerPosition.x += 1;
          playerPosition.y += 1;
        }
      }
      if (posXBefore !== playerPosition.x || posYBefore !== playerPosition.y) {
        this.updatePlayer();
        moving = true;
        window.setTimeout(function () {
          moving = false;
        }, 1000);
      }
    }
  },

  handlePointerdown: function (ev) {
    let target = ev.target;
    let synthKey = '';

    const direction = ['up', 'down', 'left', 'right'].find(dir => target.classList.contains(dir));

    switch (direction) {
      case 'up':
        synthKey = 'w';
        break;
      case 'down':
        synthKey = 's';
        break;
      case 'left':
        synthKey = 'a';
        break;
      case 'right':
        synthKey = 'd';
        break;
    }

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: synthKey }));
  },

  getPlayerPosition: function () {
    return playerPosition;
  },

  setPlayerPosition: function (x, y) {
    playerPosition.x = x;
    playerPosition.y = y;
  },

  getPlayerViewportPosition: function () {
    return {
      x: player.style.left,
      y: player.style.top,
    };
  },

  getProp: function (prop) {
    return playerProps[prop];
  },

  findObjects: function (x, y) {
    let allFoundObjectIds = [];
    x = parseInt(x);
    y = parseInt(y);

    let ids = Props.getObjectIdsAt(x, y);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    ids = Props.getObjectIdsAt(x, y - 1);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    ids = Props.getObjectIdsAt(x + 1, y - 1);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    ids = Props.getObjectIdsAt(x + 1, y);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    ids = Props.getObjectIdsAt(x + 1, y + 1);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    ids = Props.getObjectIdsAt(x, y + 1);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    ids = Props.getObjectIdsAt(x - 1, y + 1);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    ids = Props.getObjectIdsAt(x - 1, y);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    ids = Props.getObjectIdsAt(x - 1, y - 1);
    if (ids) allFoundObjectIds = allFoundObjectIds.concat(ids);

    return allFoundObjectIds;
  },

  handleFoundObjectIds: function (allFoundObjectIds) {
    Map.showObjectIconsByIds(allFoundObjectIds);
    Cards.addObjectsByIds(allFoundObjectIds);
  },
};
