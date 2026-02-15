import Audio from '../audio.js';
import Map from '../map.js';
import Props from '../props.js';

export default function fishing(actionsOrchestration, cardId, time, energy) {
  Audio.sfx('water-dip');
  Map.showScoutMarkerFor(cardId);
  actionsOrchestration.fastForward(
    actionsOrchestration,
    function (actionsOrchestration, cardId, energy) {
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
      actionsOrchestration.goBackFromAction(cardId);
    },
    cardId,
    time,
    800,
    energy
  );
}
