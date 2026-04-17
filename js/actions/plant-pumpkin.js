// @ts-check

import TimingUtils from '../utils/timing-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';
import Cards from '../cards.js';
import { ObjectState, ObjectFactory, InventoryManager } from '../core/index.js';

/**
 * @param {number} cardId
 * @returns
 */
export default async function plantingPumpkin(cardId) {
  await TimingUtils.wait(1000);
  // remove plant pot card from player position and add pumpkin plant card
  const plantPotObject = ObjectState.getObject(cardId);
  if (!plantPotObject || !plantPotObject.x || !plantPotObject.y) return;

  plantPotObject.removed = true;
  ObjectFactory.setupBuilding(plantPotObject.x, plantPotObject.y, ['pumpkin-plant'], false);
  InventoryManager.addItemToInventory('pumpkin', -1);
  InventoryManager.addItemToInventory('shovel', -1);
  InventoryManager.addItemToInventory('straw-wheet', -1);
  Cards.renderCardDeck();
  ActionsOrchestration.endAction(cardId);
  ActionsOrchestration.goBackFromAction();
}
