import Props from '../props.js';
import Player from '../player.js';
import Map from '../map.js';
import ActionsUtils from '../utils/actions-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';
import { ObjectState } from '../core/index.js';

export default function simulateScouting(cardId, time) {
  Map.showScoutMarkerFor(cardId);

  ActionsOrchestration.fastForward(
    function (cardId) {
      const object = Props.getObject(cardId);
      ActionsUtils.searchForKey(object);
      /* if (object.x % 4 === 0 || object.y % 4 === 0) { Map.mapUncoverAt(x, y); } */
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
      const allFoundObjectIds = ObjectState.findAllObjectsNearby(object.x, object.y);
      Player.handleFoundObjectIds(allFoundObjectIds);
      Map.hideScoutMarker();
      ActionsUtils.spawnCreaturesIfInfested(cardId, true);
    },
    cardId,
    time,
    800
  );
}
