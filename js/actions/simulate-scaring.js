import Props from '../props.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function simulateScaring(cardId, time, energy) {
  const object = Props.getObject(cardId);
  object.removed = true;
  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
      Props.changePlayerProp('energy', energy);
    },
    cardId,
    time,
    800,
    energy
  );
}
