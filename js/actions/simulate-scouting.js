import Props from '../props.js';
import Map from '../map.js';
import ActionsUtils from '../utils/actions-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';
import { ObjectState, EventManager, EVENTS } from '../core/index.js';

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
      EventManager.emit(EVENTS.NEW_OBJECTS_ADDED, { objectIds: allFoundObjectIds });
      Map.hideScoutMarker();
      ActionsUtils.spawnCreaturesIfInfested(cardId, true);
    },
    cardId,
    time,
    800
  );
}
