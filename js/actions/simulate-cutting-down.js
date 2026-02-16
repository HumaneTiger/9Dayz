import Audio from '../audio.js';
import Props from '../props.js';
import Items from '../items.js';
import RngUtils from '../utils/rng-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function simulateCuttingDown(cardId, time, energy) {
  Audio.sfx('chop-wood');
  Audio.sfx('chop-wood', 800);
  Audio.sfx('chop-wood', 1600);

  const object = Props.getObject(cardId);
  object.removed = true;

  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
      if (Items.inventoryContains('improvised-axe')) {
        Props.addWeaponToInventory('improvised-axe', 0, { durability: -1 });
      } else if (Items.inventoryContains('axe')) {
        Props.addWeaponToInventory('axe', 0, { durability: -1 });
      }
      Props.beginInventoryBatch();
      Props.addItemToInventory('stump', 1);
      Props.addItemToInventory('branch', 2 + Math.round(RngUtils.cuttingTreeRNG.random() - 0.25));
      Props.addItemToInventory('straw-wheet', Math.round(RngUtils.cuttingTreeRNG.random() - 0.25));
      Props.changePlayerProp('energy', energy);
      Props.endInventoryBatch();
    },
    cardId,
    time,
    800,
    energy
  );
}
