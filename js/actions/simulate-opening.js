import Audio from '../audio.js';
import Props from '../props.js';
import Items from '../items.js';
import ActionsUtils from '../utils/actions-utils.js';

export default function simulateOpening(actionsOrchestration, cardId, time, energy) {
  Audio.sfx('unlock', 0, 0.6);

  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      if (Items.inventoryContains('key')) {
        Props.addItemToInventory('key', -1);
      }
      Props.changePlayerProp('energy', energy);
      actionsOrchestration.goBackFromAction(cardId);
      ActionsUtils.spawnCreaturesIfInfested(cardId);
    },
    cardId,
    time,
    800,
    energy
  );
}
