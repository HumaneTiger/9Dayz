import Audio from '../audio.js';
import Props from '../props.js';
import Items from '../items.js';
import ActionsUtils from '../utils/actions-utils.js';

export default function simulateBreaking(actionsOrchestration, cardId, time, energy) {
  Audio.sfx('chop-wood');
  Audio.sfx('chop-wood', 800);

  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
      const object = Props.getObject(cardId);
      object.locked = false;
      if (Items.inventoryContains('improvised-axe')) {
        Props.addWeaponToInventory('improvised-axe', 0, { durability: -1 });
      } else if (Items.inventoryContains('axe')) {
        Props.addWeaponToInventory('axe', 0, { durability: -1 });
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
