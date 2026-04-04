import Items from './items.js';
import Audio from './audio.js';
import CardsMarkup from './cards-markup.js';
import {
  EventManager,
  EVENTS,
  RecipesManager,
  InventoryManager,
  CardsManager,
  ObjectState,
} from './core/index.js';
import TimingUtils from './utils/timing-utils.js';

export default {
  init: function () {
    document.body.addEventListener('mousedown', this.checkForCardClick.bind(this));

    // EVENT: React to inventory changes
    EventManager.on(EVENTS.INVENTORY_CHANGED, () => {
      this.checkAllCookingModeCards();
    });
  },

  start: async function (cardRef) {
    this.checkCookingRecipePrerequisits(cardRef);
    cardRef.classList.add('cooking-mode');
    await TimingUtils.wait(100);
    cardRef.classList.add('full');
  },

  end: async function (cardRef) {
    if (cardRef.classList.contains('cooking-mode')) {
      cardRef.classList.remove('full');
      TimingUtils.wait(100);
      cardRef.classList.remove('cooking-mode');
    }
  },

  checkAllCookingModeCards: function () {
    const allFireplaceCards = CardsManager.getCardDeck().filter(card => {
      let object = ObjectState.getObject(card.id);
      return object.name === 'fireplace';
    });
    allFireplaceCards.forEach(card => {
      const cardRef = document.getElementById(card.id);
      if (cardRef) {
        if (cardRef.classList.contains('cooking-mode')) {
          this.checkCookingRecipePrerequisits(cardRef);
        } else {
          CardsMarkup.updateCardActions(card.id); // update the 'cook' action number of recipes
        }
      }
    });
  },

  checkCookingRecipePrerequisits: function (cardRef) {
    const cookingRecipes = RecipesManager.getCookingRecipes();
    const persistentIngredients = RecipesManager.getPersistentIngredients();
    for (const recipe in cookingRecipes) {
      const recipeRow = cardRef.querySelector(`ul.cooking li[data-recipe="${recipe}"]`);
      if (!recipeRow) {
        continue;
      }
      const ingredient1 = cookingRecipes[recipe][0];
      const ingredient2 = cookingRecipes[recipe][1];
      if (InventoryManager.inventoryKnows(ingredient1)) {
        const amount = persistentIngredients.includes(ingredient1)
          ? Infinity
          : InventoryManager.inventoryItemAmount(ingredient1) || 0;
        Items.fillItemSlot(
          recipeRow.querySelectorAll('.slot.item-' + cookingRecipes[recipe][0]),
          amount
        );
      }
      if (InventoryManager.inventoryKnows(ingredient2)) {
        const amount = persistentIngredients.includes(ingredient2)
          ? Infinity
          : InventoryManager.inventoryItemAmount(ingredient2) || 0;
        Items.fillItemSlot(recipeRow.querySelectorAll('.slot.item-' + ingredient2), amount);
      }
      if (
        InventoryManager.inventoryKnows(ingredient1) &&
        InventoryManager.inventoryKnows(ingredient2)
      ) {
        const actionSlot = recipeRow.querySelector('.slot.action.item-' + recipe);
        if (!actionSlot) {
          continue;
        }
        actionSlot.classList.remove('unknown');
        if (
          !InventoryManager.inventoryContains(ingredient1) ||
          !InventoryManager.inventoryContains(ingredient2)
        ) {
          actionSlot.classList.remove('active');
          actionSlot.classList.add('inactive');
        } else {
          actionSlot.classList.remove('inactive');
          actionSlot.classList.add('active');
        }
      }
    }
  },

  checkForCardClick: function (ev) {
    const target = ev.target;
    const cardId = target.closest('div.card')?.id;
    const actionButton = target.closest('div.action-button');
    const actionSlotActive = target.closest('div.slot.action.active');
    const cookingContainer = target.closest('.card.cooking-mode');
    const leftMouseButton = ev.button === 0;
    if (cookingContainer) {
      if (actionSlotActive && leftMouseButton) {
        const recipe = actionSlotActive.dataset?.item;
        Audio.sfx('roast');
        RecipesManager.resolveRecipeIngredients(recipe);
      } else if (
        actionButton &&
        leftMouseButton &&
        actionButton.dataset.action === 'close-cooking'
      ) {
        cookingContainer.classList.remove('full');
        window.setTimeout(() => {
          cookingContainer.classList.remove('cooking-mode');
          CardsMarkup.updateCardActions(cardId);
        }, 100);
      }
    }
  },
};
