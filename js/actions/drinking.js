import Audio from '../audio.js';
import Props from '../props.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function drinking(cardId, time) {
  Audio.sfx('water');
  ActionsOrchestration.fastForward(
    function (cardId) {
      Props.changePlayerProp('thirst', 50);
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
    },
    cardId,
    time,
    800
  );
}
