import Props from '../props.js';
import Companion from '../companion.js';
import Almanac from '../almanac.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function simulatePetting(cardId, time, energy) {
  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      const object = Props.getObject(cardId);
      object.removed = true;
      const { attack, defense, ...rest } = object;
      Props.addCompanion({
        ...rest,
        damage: attack,
        protection: defense,
      });
      Companion.updateCompanionSlot();
      Almanac.makeContentKnown(object.name);
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
      Props.changePlayerProp('energy', energy);
    },
    cardId,
    time,
    2000,
    energy
  );
}
