import Audio from '../audio.js';
import Props from '../props.js';
import Items from '../items.js';
import ActionsUtils from '../utils/actions-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function simulateBreaking(cardId, time, energy) {
  Audio.sfx('chop-wood');
  Audio.sfx('chop-wood', 800);

  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      if (Items.inventoryContains('improvised-axe')) {
        Props.addWeaponToInventory('improvised-axe', 0, { durability: -1 });
      } else if (Items.inventoryContains('axe')) {
        Props.addWeaponToInventory('axe', 0, { durability: -1 });
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
