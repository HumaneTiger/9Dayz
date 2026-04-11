import {
  EventManager,
  EVENTS,
  GameState,
  PlayerManager,
  ObjectState,
  CharacterManager,
  MapManager,
} from './core/index.js';
import Cards from './cards.js';
import Map from './map.js';
import Battle from './battle.js';
import Ui from './ui.js';
import Viewport from './viewport.js';

const allPaths = MapManager.getAllPaths();
const playerPosition = GameState.getGameProp('playerPosition');

let player = document.getElementById('player');

export default {
  init: function () {
    EventManager.on(EVENTS.PLAYER_MOVE_TO, ({ x, y }) => {
      this.movePlayerTo(x, y);
    });
    EventManager.on(EVENTS.PLAYER_UPDATE, ({ noPenalty }) => {
      this.updatePlayer(noPenalty);
    });
    PlayerManager.changePlayerProp('health', 0); // trigger initial UI update
    PlayerManager.changePlayerProp('food', 0);
    PlayerManager.changePlayerProp('thirst', 0);
    PlayerManager.changePlayerProp('energy', 0);
    this.initPlayer();
    this.initMovement();
  },

  checkForDamage: function () {
    this.updateDamageOverlay(PlayerManager.getProp('health'));
  },

  checkForDeath: function (secondWind) {
    if (PlayerManager.getProp('health') <= 0) {
      // 50:50 chance
      if (!secondWind || Math.random() >= 0.5) {
        EventManager.emit(EVENTS.GAME_OVER);
        return true;
      }
    }
    return false;
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
    // check if player enters or leaves the boat
    const shipHotSpot = MapManager.getShipHotSpot();
    if (playerPosition.x === shipHotSpot.x && playerPosition.y === shipHotSpot.y) {
      if (!GameState.getGameProp('onBoard')) {
        EventManager.emit(EVENTS.PLAYER_BOARDED_SHIP);
      } else {
        EventManager.emit(EVENTS.PLAYER_LEFT_SHIP);
      }
    }
    window.setTimeout(() => {
      const objectsHere = ObjectState.getObjectsAt(playerPosition.x, playerPosition.y);
      this.findAndHandleObjects();
      Cards.enableActions();
      if (objectsHere?.some(obj => obj.group === 'zombie' && !obj.dead)) {
        window.setTimeout(() => {
          Battle.startBattle(objectsHere[0], true);
        }, 800);
      }
    }, 0);

    if (!noPenalty) {
      PlayerManager.changePlayerProp('energy', -1);
      PlayerManager.changePlayerProp('thirst', -2);
      PlayerManager.changePlayerProp('food', -1);
    }

    CharacterManager.applyHighCalorieConsumptionChanges();

    if (PlayerManager.getProp('food') <= 0) PlayerManager.changePlayerProp('health', -5);
    if (PlayerManager.getProp('thirst') <= 0) PlayerManager.changePlayerProp('health', -5);
    if (PlayerManager.getProp('energy') <= 0) PlayerManager.changePlayerProp('energy', -5);

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
      !GameState.getGameProp('isWalking') &&
      !GameState.getGameProp('isMoveLocked') &&
      !GameState.getGameProp('gamePaused')
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
        GameState.setGameProp('isWalking', true);
        window.setTimeout(function () {
          GameState.setGameProp('isWalking', false);
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

  handleFoundObjectIds: function (allFoundObjectIds) {
    Map.showObjectIconsByIds(allFoundObjectIds);
    Cards.addObjectsByIds(allFoundObjectIds);
  },
};
