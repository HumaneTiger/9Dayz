// @ts-check

import ActionsOrchestration from '../actions-orchestration.js';
import Cards from '../cards.js';
import { ObjectState, ObjectFactory, InventoryManager, PlayerManager } from '../core/index.js';

/**
 * @param {number} cardId
 * @param {number} time
 * @param {number} energy
 * @returns
 */
export default async function plantingPepper(cardId, time, energy) {
  ActionsOrchestration.fastForward(
    /**
     *
     * @param {number} cardId
     * @param {number} energy
     */
    function (cardId, energy) {
      // remove plant pot card from player position and add pepper plant card
      const plantPotObject = ObjectState.getObject(cardId);
      if (!plantPotObject || !plantPotObject.x || !plantPotObject.y) return;

      plantPotObject.removed = true;
      ObjectFactory.setupBuilding(plantPotObject.x, plantPotObject.y, ['pepper-plant'], false);
      InventoryManager.addItemToInventory('pepper', -1);
      InventoryManager.addItemToInventory('shovel', -1);
      InventoryManager.addItemToInventory('branch', -1);
      Cards.renderCardDeck();
      PlayerManager.changePlayerProp('energy', energy);
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
    },
    cardId,
    time,
    0,
    energy
  );
}
