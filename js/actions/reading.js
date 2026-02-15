import TimingUtils from '../utils/timing-utils.js';
import Props from '../props.js';
import Audio from '../audio.js';
import Map from '../map.js';
import Checkpoint from '../checkpoint.js';

export default async function reading(actionsOrchestration, cardId) {
  await TimingUtils.wait(1800);
  const targetLocationName = Props.getObject(cardId).name;
  Audio.sfx('note');
  if (targetLocationName === 'signpost-1') {
    Map.showTargetLocation('Lakeside Camp Resort');
    Map.showTargetLocation('Rocksprings');
  } else if (targetLocationName === 'signpost-2') {
    Map.showTargetLocation('Litchfield');
  } else if (targetLocationName === 'signpost-3') {
    Map.showTargetLocation('Greenleafton');
  } else if (targetLocationName === 'signpost-4') {
    Map.showTargetLocation('Haling Cove');
  } else if (targetLocationName === 'signpost-5') {
    Map.showTargetLocation('Billibalds Farm');
  } else if (targetLocationName === 'signpost-6') {
    Map.showTargetLocation('Camp Silverlake');
  } else if (targetLocationName === 'signpost-7') {
    Map.showTargetLocation('Harbor Gas Station');
  }
  if (Props.getGameProp('tutorial') === false) {
    Checkpoint.save(targetLocationName);
  }
  actionsOrchestration.goBackFromAction(cardId);
}
