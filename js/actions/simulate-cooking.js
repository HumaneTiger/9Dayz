import Cards from '../cards.js';
import Cooking from '../cooking.js';
import TimingUtils from '../utils/timing-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default async function simulateCooking(cardId) {
  const cardRef = Cards.getCardById(cardId);
  await TimingUtils.wait(800);
  Cooking.start(cardRef);
  ActionsOrchestration.endAction(cardId);
  ActionsOrchestration.goBackFromAction();
}
