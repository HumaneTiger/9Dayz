import Cards from '../cards.js';
import Cooking from '../cooking.js';
import TimingUtils from '../utils/timing-utils.js';

export default async function simulateCooking(actionsOrchestration, cardId) {
  const cardRef = Cards.getCardById(cardId);
  await TimingUtils.wait(800);
  Cooking.start(cardRef);
  actionsOrchestration.goBackFromAction(cardId);
}
