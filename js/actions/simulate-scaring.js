import Props from '../props.js';

export default function simulateScaring(actionsOrchestration, cardId, time, energy) {
  const object = Props.getObject(cardId);
  object.removed = true;
  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
      actionsOrchestration.goBackFromAction(cardId);
      Props.changePlayerProp('energy', energy);
    },
    cardId,
    time,
    800,
    energy
  );
}
