// @ts-check

import TimingUtils from '../utils/timing-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';
import Ui from '../ui.js';

/**
 *
 * @param {number} cardId
 */
export default async function reading(cardId) {
  await TimingUtils.wait(1000);
  Ui.showFuelingShipInventory();
  ActionsOrchestration.endAction(cardId);
  ActionsOrchestration.goBackFromAction();
}
