import Props from '../props.js';
import Map from '../map.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function simulateSleeping(cardId, time, energy) {
  Map.showScoutMarkerFor(cardId);
  if (Props.getGameProp('timeMode') === 'night') {
    energy += 20;
  }
  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      Props.changePlayerProp('energy', energy);
      Props.changePlayerProp('health', Math.floor(energy / 2));
      Props.changePlayerProp('food', -18);
      Props.changePlayerProp('thirst', -24);
      Map.hideScoutMarker();
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
    },
    cardId,
    time,
    100,
    energy
  );
}
