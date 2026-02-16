import Audio from '../audio.js';
import Map from '../map.js';
import Props from '../props.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default function fishing(cardId, time, energy) {
  Audio.sfx('water-dip');
  Map.showScoutMarkerFor(cardId);
  ActionsOrchestration.fastForward(
    function (cardId, energy) {
      Map.hideScoutMarker();
      Props.changePlayerProp('energy', energy);
      Props.changePlayerProp('food', -5);
      Props.changePlayerProp('thirst', -10);
      // baits would be nice as well
      const object = Props.getObject(cardId);
      const success = Props.rngFishSpawn(object.x, object.y);
      if (success) {
        Audio.sfx('fish-catch');
        Props.addWeaponToInventory('fishing-rod', 0, { durability: -1 });
      }
      ActionsOrchestration.endAction(cardId);
      ActionsOrchestration.goBackFromAction();
    },
    cardId,
    time,
    800,
    energy
  );
}
