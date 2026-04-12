// @ts-check

import TimingUtils from '../utils/timing-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';
import Cards from '../cards.js';
import { ObjectState, MapManager, NpcManager, TutorialManager } from '../core/index.js';

/**
 *
 * @param {number} cardId
 */
export default async function reading(cardId) {
  await TimingUtils.wait(1000);
  const object = ObjectState.getObject(cardId);
  if (object.name && object.x && object.y) {
    const nextDialogEventId = NpcManager.getNextNpcDialogEventId(
      object.name,
      MapManager.currentMapKey
    );
    if (nextDialogEventId) {
      let objectId = TutorialManager.setupSpecialEvent(nextDialogEventId, object.x, object.y);
      Cards.addSingleSpecialEventCard(objectId);
      Cards.renderCardDeck();
    }
  }
  ActionsOrchestration.endAction(cardId);
  ActionsOrchestration.goBackFromAction();
}
