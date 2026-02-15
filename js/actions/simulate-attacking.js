import Props from '../props.js';
import Player from '../player.js';
import Cards from '../cards.js';
import Battle from '../battle.js';
import TimingUtils from '../utils/timing-utils.js';

export default async function simulateAttacking(actionsOrchestration, cardId) {
  const object = Props.getObject(cardId);
  const allFoundObjectIds = Player.findObjects(object.x, object.y);

  const zedsOnly = allFoundObjectIds.filter(
    singleObject => Props.getObject(singleObject).group === 'zombie'
  );
  Cards.showAllZedsNearby();
  Player.handleFoundObjectIds(zedsOnly);
  Cards.disableActions();

  await TimingUtils.wait(800);
  actionsOrchestration.endAction(cardId);
  Battle.startBattle();
}
