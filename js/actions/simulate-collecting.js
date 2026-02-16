import Props from '../props.js';
import TimingUtils from '../utils/timing-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default async function simulateCollecting(cardId, energy) {
  const object = Props.getObject(cardId);
  object.removed = true;
  await TimingUtils.wait(1200);
  Props.addItemToInventory(object.name, 1);
  Props.changePlayerProp('energy', energy);
  ActionsOrchestration.endAction(cardId);
  ActionsOrchestration.goBackFromAction();
}
