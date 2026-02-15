import Props from '../props.js';
import Player from '../player.js';
import Map from '../map.js';
import ActionsUtils from '../utils/actions-utils.js';

export default function simulateScouting(actionsOrchestration, cardId, time, energy) {
  Map.showScoutMarkerFor(cardId);

  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
      const object = Props.getObject(cardId);
      ActionsUtils.searchForKey(object);
      /* if (object.x % 4 === 0 || object.y % 4 === 0) { Map.mapUncoverAt(x, y); } */
      actionsOrchestration.goBackFromAction(cardId);
      const allFoundObjectIds = Player.findObjects(object.x, object.y);
      Player.handleFoundObjectIds(allFoundObjectIds);
      Map.hideScoutMarker();
      Props.changePlayerProp('energy', energy);
      ActionsUtils.spawnCreaturesIfInfested(cardId, true);
    },
    cardId,
    time,
    800,
    energy
  );
}
