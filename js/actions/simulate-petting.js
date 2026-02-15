import Props from '../props.js';
import Character from '../character.js';
import Almanac from '../almanac.js';

export default function simulatePetting(actionsOrchestration, cardId, time, energy) {
  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
      const object = Props.getObject(cardId);
      object.removed = true;
      const { attack, defense, ...rest } = object;
      Props.addCompanion({
        ...rest,
        damage: attack,
        protection: defense,
      });
      Character.updateCompanionSlot();
      Almanac.makeContentKnown(object.name);
      actionsOrchestration.goBackFromAction(cardId);
      Props.changePlayerProp('energy', energy);
    },
    cardId,
    time,
    2000,
    energy
  );
}
