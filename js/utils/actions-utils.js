import Player from '../player.js';
import Props from '../props.js';
import Cards from '../cards.js';
import CardsMarkup from '../cards-markup.js';

/* === Simulation and helper functions === */

export default {
  addGuarenteedTapeToFirstSearch: function (object, cardRef, allItems) {
    // adding a guaranteed tape to first searched car/house/train
    if (
      !Props.getGameProp('firstSearch') &&
      (object.type === 'car' || object.type === 'house' || object.type === 'train') &&
      cardRef.querySelector('ul.items')
    ) {
      Props.setGameProp('firstSearch', true);
      // replace first item in data and markup
      // but only if the item isn't already there
      if (!allItems.some(el => el.name === 'tape' && el.amount > 0)) {
        allItems[0] = { name: 'tape', amount: 1 };
        cardRef.querySelector('ul.items li.preview').remove();
        cardRef.querySelector('ul.items li.item').remove();
        cardRef.querySelector('ul.items').innerHTML =
          CardsMarkup.generateItemMarkup('tape', 1) + cardRef.querySelector('ul.items').innerHTML;
      }
    }
  },

  searchForKey: function (object) {
    if (object.locked && object.hasKey) {
      object.hasKey = false;
      Props.setupBuilding(
        Player.getPlayerPosition().x,
        Player.getPlayerPosition().y,
        new Array('key')
      );
    }
  },

  spawnCreaturesIfInfested: function (cardId, onlyRats = false) {
    /* when scouting/breaking/opening an infested building, spawn creatures (they do not attack) */
    const cardRef = Cards.getCardById(cardId);
    const object = Props.getObject(cardId);
    if (object.infested && !object.locked) {
      if (!onlyRats || object.name !== 'beehive') {
        let hostileObjectIds = Props.spawnCreaturesAt(object.x, object.y, object.enemies);
        // building not infested anymore
        cardRef.classList.remove('infested');
        object.infested = false;
        // search action not critical any more
        const action = object.actions?.find(a => a.name === 'search' || a.name === 'gather');
        if (action) action.critical = false;
        // update card deck with new creature cards
        Player.handleFoundObjectIds(hostileObjectIds);
      }
    }
  },
};
