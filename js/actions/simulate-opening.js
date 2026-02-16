import Audio from '../audio.js';
import Props from '../props.js';
import Items from '../items.js';
import ActionsUtils from '../utils/actions-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function simulateOpening(cardId, time, energy) {
  Audio.sfx('unlock', 0, 0.6);

  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      if (Items.inventoryContains('key')) {
        Props.addItemToInventory('key', -1);
      }
      Props.changePlayerProp('energy', energy);
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
      ActionsUtils.spawnCreaturesIfInfested(cardId);
    },
    cardId,
    time,
    800,
    energy
  );
}
