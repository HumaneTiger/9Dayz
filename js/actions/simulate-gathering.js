import Props from '../props.js';
import Cards from '../cards.js';
import Battle from '../battle.js';
import TimingUtils from '../utils/timing-utils.js';
import ActionsUtils from '../utils/actions-utils.js';
import ActionsOrchestration from '../actions-orchestration.js';

export default async function simulateGathering(cardId, time, energy) {
  const object = Props.getObject(cardId);
  const cardRef = Cards.getCardById(cardId);
  const allItems = object.items;

  ActionsUtils.addGuarenteedTapeToFirstSearch(object, cardRef, allItems);

  let allPreviews = cardRef.querySelectorAll('ul.items li.preview');

  let timeout = 2000;
  let delay = 2000;

  if (object.infested) {
    ActionsUtils.spawnCreaturesIfInfested(cardId);
    await TimingUtils.wait(1200);
    ActionsOrchestration.endAction(cardId);
    Battle.startBattle(true); // instant attack when place is infested
  } else if (allPreviews) {
    /** it's a strange condition, but I think this is what it does:
     * it wants to make sure that the gathering action was never used before
     * only in that case, there are more random other buildings spawning (like basements, corpses)
     * it prevents these buildings from spawning again when e.g. the card is revealed a second time
     */
    cardRef.querySelector('ul.items')?.classList.remove('is--hidden');
    allPreviews[0].querySelector('.unknown').classList.add('is--hidden');
    allPreviews[0].querySelector('.searching').classList.remove('is--hidden');
    /* houses and villas will randomly spawn corpses or basements when searched */
    if (object.additionalGameObjects && object.additionalGameObjects.length > 0) {
      object.additionalGameObjects.forEach(addGameObject => {
        if (addGameObject.group === 'building') {
          Props.setupBuilding(
            addGameObject.x,
            addGameObject.y,
            new Array(addGameObject.name),
            addGameObject.forceInfested,
            addGameObject.forceLootItemList,
            addGameObject.forceCreaturesList,
            addGameObject.forceAdditionalGameObjects
          );
        } else if (addGameObject.group === 'animal') {
          Props.spawnAnimal(addGameObject);
        }
      });
    }
    await TimingUtils.wait(delay);
    for (let i = 0; i < allItems.length; i += 1) {
      const item = allItems[i];
      allPreviews[i].classList.add('is--hidden');
      if (item.amount > 0) {
        cardRef
          .querySelector('ul.items li[data-item="' + item.name + '"].is--hidden')
          .classList.remove('is--hidden');
      }
      if (i + 1 < allItems.length) {
        allPreviews[i + 1].querySelector('.unknown').classList.add('is--hidden');
        allPreviews[i + 1].querySelector('.searching').classList.remove('is--hidden');
      }
      if (i + 1 === allItems.length) {
        ActionsOrchestration.endAction(cardId);
        ActionsOrchestration.goBackFromAction();
        Props.changePlayerProp('energy', energy);
        // furbuddy takes damage when cutting animals
        if (Props.getGameProp('character') === 'furbuddy' && object.group === 'animal') {
          Props.changePlayerProp('health', -10);
        }
        if (
          !allItems.some(function (item) {
            return item.amount > 0;
          })
        ) {
          cardRef.querySelector('ul.items').remove();
          cardRef.querySelector('div.banner')?.classList.remove('is--hidden');
          cardRef.classList.add('looted');
          // check if card can be removed (no actions left)
          Cards.renderCardDeck();
        }
      }
      await TimingUtils.wait(timeout);
    }
  }
}
