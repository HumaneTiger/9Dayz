// @ts-check

import ActionsOrchestration from '../actions-orchestration.js';
import Audio from '../audio.js';
import { ObjectState, InventoryManager, WeaponsManager, PlayerManager } from '../core/index.js';

/**
 * @param {number} cardId
 * @param {number} time
 * @param {number} energy
 * @returns
 */
export default async function destroying(cardId, time, energy) {
  Audio.sfx('chop-wood');
  Audio.sfx('chop-wood', 800);

  ActionsOrchestration.fastForward(
    /**
     *
     * @param {number} cardId
     * @param {number} energy
     */
    function (cardId, energy) {
      const object = ObjectState.getObject(cardId);
      object.removed = true;
      if (InventoryManager.inventoryContains('improvised-axe')) {
        WeaponsManager.addWeaponToInventory('improvised-axe', 0, { durability: -1 });
      } else if (InventoryManager.inventoryContains('axe')) {
        WeaponsManager.addWeaponToInventory('axe', 0, { durability: -1 });
      }
      PlayerManager.changePlayerProp('energy', energy);
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
    },
    cardId,
    time,
    800,
    energy
  );
}
