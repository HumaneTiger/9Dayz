import Props from '../props.js';
import Cards from '../cards.js';
import Battle from '../battle.js';
import TimingUtils from '../utils/timing-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';
import { ObjectState, EventManager, EVENTS } from '../core/index.js';

export default async function simulateAttacking(cardId) {
  const object = Props.getObject(cardId);
  const zedsOnly = ObjectState.findAllZedsNearObject(object.x, object.y);

  Cards.showAllZedsNearby(zedsOnly);
  EventManager.emit(EVENTS.NEW_OBJECTS_ADDED, { objectIds: zedsOnly });
  Cards.disableActions();

  await TimingUtils.wait(800);
  ActionsOrchestration.endAction(cardId);
  Battle.startBattle(object);
}
