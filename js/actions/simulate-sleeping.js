import Props from '../props.js';
import Map from '../map.js';

export default function simulateSleeping(actionsOrchestration, cardId, time, energy) {
  Map.showScoutMarkerFor(cardId);
  if (Props.getGameProp('timeMode') === 'night') {
    energy += 20;
  }
  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
      Props.changePlayerProp('energy', energy);
      Props.changePlayerProp('health', Math.floor(energy / 2));
      Props.changePlayerProp('food', -18);
      Props.changePlayerProp('thirst', -24);
      Map.hideScoutMarker();
      actionsOrchestration.goBackFromAction(cardId);
    },
    cardId,
    time,
    100,
    energy
  );
}
