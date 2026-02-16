import Player from '../player.js';
import Cards from '../cards.js';
import Props from '../props.js';
import Map from '../map.js';
import Battle from '../battle.js';
import TimingUtils from '../utils/timing-utils.js';
import Audio from '../audio.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default async function simulateLuring(cardId, time, energy) {
  Player.lockMovement(true);
  Cards.disableActions();

  const scoutMarker = document.getElementById('scoutmarker');

  scoutMarker.style.left = Math.round(Player.getPlayerPosition().x * 44.4) + 'px';
  scoutMarker.style.top = Math.round(Player.getPlayerPosition().y * 44.4) + 'px';
  scoutMarker.classList.remove('is--hidden');

  ActionsOrchestration.fastForward(
    async function (cardId, energy) {
      const object = Props.getObject(cardId);
      ActionsOrchestration.endAction(cardId);

      Map.hideScoutMarker();

      if (object.luringSuccessful) {
        Battle.startBattle(false, cardId);
      } else {
        const cardRef = Cards.getCardById(cardId);
        Cards.enableActions();
        Player.lockMovement(false);
        Props.changePlayerProp('energy', energy);
        Audio.sfx('nope');
        cardRef?.classList.add('card-heavy-shake');
        await TimingUtils.wait(200);
        cardRef?.classList.remove('card-heavy-shake');
        Cards.renderCardDeck();
      }
    },
    cardId,
    time,
    1600,
    energy
  );
}
