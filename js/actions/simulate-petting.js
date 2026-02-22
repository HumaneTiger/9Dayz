import Props from '../props.js';
import Companion from '../companion.js';
import ActionsOrchestration from '../actions-orchestration.js';
import AlmanacManager from '../core/almanac-manager.js';

export default function simulatePetting(cardId, time, energy) {
  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      const object = Props.getObject(cardId);
      if (object.group === 'animal' && object.name) {
        object.removed = true;
        Props.addCompanionToInventory(object.name, {
          name: object.name,
          damage: object.attack,
          protection: object.defense,
          health: object.health,
          maxHealth: object.maxHealth,
        });
      }
      AlmanacManager.makeContentKnown(object.name);
      Companion.updateCompanionSlot();
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
