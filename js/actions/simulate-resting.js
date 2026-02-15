import Props from '../props.js';
import Map from '../map.js';

export default function simulateResting(actionsOrchestration, cardId, time, energy) {
  Map.showScoutMarkerFor(cardId);
  if (Props.getGameProp('timeMode') === 'night') {
    energy += 5;
  }
  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
      Props.changePlayerProp('energy', energy);
      Props.changePlayerProp('health', Math.floor(energy / 2));
      Props.changePlayerProp('food', -10);
      Props.changePlayerProp('thirst', -14);
      Map.hideScoutMarker();
      actionsOrchestration.goBackFromAction(cardId);
    },
    cardId,
    time,
    800,
    energy
  );
}
