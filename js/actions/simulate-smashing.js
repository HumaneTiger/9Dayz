import Audio from '../audio.js';
import Props from '../props.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function simulateSmashing(cardId, time, energy) {
  Audio.sfx('break-glass', 350);

  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      Props.changePlayerProp('energy', energy);
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
    },
    cardId,
    time,
    800,
    energy
  );
}
