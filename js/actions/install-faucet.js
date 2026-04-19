// @ts-check

import TimingUtils from '../utils/timing-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';
import Cards from '../cards.js';
import { ObjectState, ObjectFactory, InventoryManager, AlmanacManager } from '../core/index.js';

/**
 * @param {number} cardId
 * @returns
 */
export default async function installingFaucet(cardId) {
  await TimingUtils.wait(1000);
  // remove water barrel card from player position and add rain collector card
  const waterBarrelObject = ObjectState.getObject(cardId);
  if (!waterBarrelObject || !waterBarrelObject.x || !waterBarrelObject.y) return;

  waterBarrelObject.removed = true;
  ObjectFactory.setupBuilding(waterBarrelObject.x, waterBarrelObject.y, ['rain-collector'], false);
  InventoryManager.addItemToInventory('faucet', -1);
  AlmanacManager.makeContentKnown('rain-collector');
  Cards.renderCardDeck();
  ActionsOrchestration.endAction(cardId);
  ActionsOrchestration.goBackFromAction();
}
