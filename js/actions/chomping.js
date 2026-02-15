import Player from '../player.js';
import Cards from '../cards.js';
import Audio from '../audio.js';
import Map from '../map.js';
import Battle from '../battle.js';

export default function chomping(actionsOrchestration, cardId, time, energy) {
  Player.lockMovement(true);
  Cards.disableActions();
  Audio.sfx('bark');

  const scoutMarker = document.getElementById('scoutmarker');
  scoutMarker.style.left = Math.round(Player.getPlayerPosition().x * 44.4) + 'px';
  scoutMarker.style.top = Math.round(Player.getPlayerPosition().y * 44.4) + 'px';
  scoutMarker.classList.remove('is--hidden');

  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId) {
      actionsOrchestration.endAction(cardId);
      Map.hideScoutMarker();
      Battle.startCompanionBattle(cardId);
    },
    cardId,
    time,
    400,
    energy
  );
}
