import Audio from '../audio.js';
import Props from '../props.js';

export default function simulateSmashing(actionsOrchestration, cardId, time, energy) {
  Audio.sfx('break-glass', 350);

  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      Props.changePlayerProp('energy', energy);
      actionsOrchestration.goBackFromAction(cardId);
    },
    cardId,
    time,
    800,
    energy
  );
}
