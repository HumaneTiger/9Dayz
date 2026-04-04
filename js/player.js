import {
  EventManager,
  EVENTS,
  PlayerManager,
  ObjectState,
  CharacterManager,
  MapManager,
} from './core/index.js';
import Props from './props.js';
import Cards from './cards.js';
import Map from './map.js';
import Battle from './battle.js';
import Ui from './ui.js';
import Viewport from './viewport.js';

const allPaths = MapManager.getAllPaths();
const playerProps = Props.getPlayerProps();
const playerPosition = Props.getGameProp('playerPosition');

let player = document.getElementById('player');

export default {
  init: function () {
    EventManager.on(EVENTS.PLAYER_MOVE_TO, ({ x, y }) => {
      this.movePlayerTo(x, y);
    });
    EventManager.on(EVENTS.PLAYER_UPDATE, ({ noPenalty }) => {
      this.updatePlayer(noPenalty);
    });
    Props.changePlayerProp('health', 0); // trigger initial UI update
    Props.changePlayerProp('food', 0);
    Props.changePlayerProp('thirst', 0);
    Props.changePlayerProp('energy', 0);
    this.initPlayer();
    this.initMovement();
  },

  checkForDamage: function () {
    this.updateDamageOverlay(this.getProp('health'));
  },

  checkForDeath: function (secondWind) {
    if (this.getProp('health') <= 0) {
      // 50:50 chance
      if (!secondWind || Math.random() >= 0.5) {
        EventManager.emit(EVENTS.GAME_OVER);
        return true;
      }
    }
    return false;
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
          Battle.startBattle(objectsHere[0], true);
        }, 800);
      }
    }, 0);

    if (!noPenalty) {
      Props.changePlayerProp('energy', -1);
      Props.changePlayerProp('thirst', -2);
      Props.changePlayerProp('food', -1);
    }

    CharacterManager.applyHighCalorieConsumptionChanges();

    if (this.getProp('food') <= 0) Props.changePlayerProp('health', -5);
    if (this.getProp('thirst') <= 0) Props.changePlayerProp('health', -5);
    if (this.getProp('energy') <= 0) Props.changePlayerProp('energy', -5);

    this.checkForDeath(true);
  },

  findAndHandleObjects: function () {
    const allFoundObjectIds = ObjectState.findAllObjectsNearby(playerPosition.x, playerPosition.y);
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
      Viewport.zoomMap(0, 1.1);
    } else {
      Viewport.resetZoom();
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
    return PlayerManager.lockMovement(moveable);
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

    if (
      !Props.getGameProp('isWalking') &&
      !Props.getGameProp('isMoveLocked') &&
      !Props.getGameProp('gamePaused')
    ) {
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
        Props.setGameProp('isWalking', true);
        window.setTimeout(function () {
          Props.setGameProp('isWalking', false);
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

  handleFoundObjectIds: function (allFoundObjectIds) {
    Map.showObjectIconsByIds(allFoundObjectIds);
    Cards.addObjectsByIds(allFoundObjectIds);
  },
};
