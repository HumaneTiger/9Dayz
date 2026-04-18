// @ts-check
import TimingUtils from './utils/timing-utils.js';
import { GameState, EventManager, EVENTS, MapManager, ShipManager } from './core/index.js';

const playerContainer = document.getElementById('player');
const shipOverlay = document.getElementById('ship-overlay');

export default {
  init: function () {
    EventManager.on(EVENTS.PLAYER_BOARDED_SHIP, () => {
      this.boardShip();
    });
    EventManager.on(EVENTS.PLAYER_LEFT_SHIP, () => {
      this.leaveShip();
    });
    ShipManager.addFuel(0); // trigger initial UI update
    ShipManager.addWaitingTime(0);
  },

  boardShip: async function () {
    if (!playerContainer || !shipOverlay) return;
    MapManager.setupShipPaths();
    const playerPosition = GameState.getGameProp('playerPosition');
    shipOverlay.classList.remove('is--hidden');
    playerPosition.y -= 1;
    EventManager.emit(EVENTS.PLAYER_MOVE_TO, { x: playerPosition.x, y: playerPosition.y });
    await TimingUtils.wait(100);
    shipOverlay.classList.add('is--visible');
    playerContainer.classList.add('onboard');
    document.querySelector('#gametime-countdown em.is--paused')?.classList.remove('is--hidden');
  },

  leaveShip: async function () {
    if (!playerContainer || !shipOverlay) return;
    MapManager.removeShipPaths();
    shipOverlay.classList.remove('is--visible');
    const playerPosition = GameState.getGameProp('playerPosition');
    playerContainer.classList.remove('onboard');
    playerPosition.y += 1;
    EventManager.emit(EVENTS.PLAYER_MOVE_TO, { x: playerPosition.x, y: playerPosition.y });
    await TimingUtils.wait(1000);
    shipOverlay.classList.add('is--hidden');
    document.querySelector('#gametime-countdown em.is--paused')?.classList.add('is--hidden');
  },
};
