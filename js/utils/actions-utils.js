import Player from '../player.js';
import Props from '../props.js';
import Cards from '../cards.js';
import CardsMarkup from '../cards-markup.js';
import TimingUtils from './timing-utils.js';
import AudioUtils from './audio-utils.js';
import { ActionsDefinitions } from '../../data/definitions/index.js';
import { ObjectState } from '../core/index.js';

/* === Simulation and helper functions === */

export default {
  notEnoughEnergyFeedback: async function () {
    const energyMeter = document.querySelector('#properties li.energy');
    energyMeter?.classList.add('heavy-shake');
    await TimingUtils.wait(200);
    energyMeter?.classList.remove('heavy-shake');
    AudioUtils.sfx('nope');
  },

  actionLockedFeedback: async function (cardId) {
    const cardRef = Cards.getCardById(cardId);
    cardRef?.classList.add('card-shake');
    await TimingUtils.wait(200);
    cardRef?.classList.remove('card-shake');
    AudioUtils.sfx('nope');
  },

  removeOneTimeActions: function (cardId, action) {
    const object = ObjectState.getObject(cardId);
    const actionProps = ActionsDefinitions.actionProps[action];
    const cardRef = Cards.getCardById(cardId);
    if (actionProps.oneTime) {
      for (let i = object.actions.length - 1; i >= 0; i--) {
        if (object.actions[i].id === action) {
          if (!(object.infested && (action === 'search' || action === 'gather'))) {
            cardRef.querySelector('li.' + action).remove();
            object.actions.splice(i, 1);
          }
        }
      }
    }
  },

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
        const action = object.actions?.find(a => a.id === 'search' || a.id === 'gather');
        console.log('actions', object.actions);
        console.log('action', action);
        console.log('critical', action?.critical);
        if (action) {
          action.critical = false;
          // update actions
          console.log('updating card actions for', cardId);
          CardsMarkup.updateCardActions(cardId);
        }
        // update card deck with new creature cards
        Player.handleFoundObjectIds(hostileObjectIds);
      }
    }
  },

  grabItem: async function (cardId, container, itemName) {
    const object = Props.getObject(cardId);
    const itemAmount = object.items.find(singleItem => singleItem.name === itemName)?.amount;
    let cardRef = Cards.getCardById(cardId);
    if (Props.isWeapon(itemName)) {
      // spawn card representing the grabbed weapon item
      Props.setupWeapon(Player.getPlayerPosition().x, Player.getPlayerPosition().y, itemName);
    } else if (itemName === 'crate') {
      // spawn card representing the grabbed crate item
      Props.setupBuilding(
        Player.getPlayerPosition().x,
        Player.getPlayerPosition().y,
        new Array('crate')
      );
    } else {
      Props.addItemToInventory(itemName, itemAmount);
    }
    object.items.find(singleItem => singleItem.name === itemName).amount = 0;
    AudioUtils.sfx('pick', 0, 0.1);
    container.classList.add('transfer');
    await TimingUtils.waitForTransition(container);
    if (cardRef) {
      container.classList.add('is--hidden');
      if (itemName === 'crate' || Props.isWeapon(itemName)) {
        Player.findAndHandleObjects();
      } // this LOC must be placed here, otherwise the "grab slot" for weapons isn't removed correctly
      if (
        object.items.filter(singleItem => singleItem.amount > 0).length === 0 &&
        !cardRef.querySelectorAll('ul.items li.preview:not(.is--hidden)')?.length
      ) {
        Cards.renderCardDeck();
      }
    }
  },
};
