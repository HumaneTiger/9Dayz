import Audio from '../audio.js';
import Props from '../props.js';

export default function drinking(actionsOrchestration, cardId, time) {
  Audio.sfx('water');
  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId) {
      Props.changePlayerProp('thirst', 50);
      actionsOrchestration.goBackFromAction(cardId);
    },
    cardId,
    time,
    800
  );
}
