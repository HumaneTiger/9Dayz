import Props from '../props.js';
import TimingUtils from '../utils/timing-utils.js';

export default async function simulateCollecting(actionsOrchestration, cardId, energy) {
  const object = Props.getObject(cardId);
  object.removed = true;
  await TimingUtils.wait(1200);
  Props.addItemToInventory(object.name, 1);
  Props.changePlayerProp('energy', energy);
  actionsOrchestration.goBackFromAction(cardId);
}
