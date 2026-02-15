import Props from '../props.js';
import TimingUtils from '../utils/timing-utils.js';

export default async function simulateEquipping(actionsOrchestration, cardId) {
  await TimingUtils.wait(800);
  const object = Props.getObject(cardId);
  if (object.group === 'weapon' && object.name) {
    Props.addWeaponToInventory(object.name, 1, {
      durability: object.durability,
      damage: object.attack,
      protection: object.defense,
    });
  }
  actionsOrchestration.goBackFromAction(cardId);
}
