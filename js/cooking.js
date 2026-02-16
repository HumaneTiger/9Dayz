import Items from './items.js';
import Audio from './audio.js';
import { EventManager, EVENTS, RecipesManager, InventoryManager } from './core/index.js';
import TimingUtils from './utils/timing-utils.js';

//const cookingRecipes = RecipeDefinitions.cookingRecipes;

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
    let allCardRefs = document.querySelectorAll('#cards .card.cooking-mode');
    for (let i = 0; i < allCardRefs.length; i += 1) {
      this.checkCookingRecipePrerequisits(allCardRefs[i]);
    }
  },

  checkCookingRecipePrerequisits: function (cardRef) {
    const cookingRecipes = RecipesManager.getCookingRecipes();
    for (const recipe in cookingRecipes) {
      const recipeRow = cardRef.querySelector(`ul.cooking li[data-recipe="${recipe}"]`);
      if (!recipeRow) {
        continue;
      }
      if (InventoryManager.inventoryKnows(cookingRecipes[recipe][0])) {
        Items.fillItemSlot(
          recipeRow.querySelectorAll('.slot.item-' + cookingRecipes[recipe][0]),
          InventoryManager.inventoryItemAmount(cookingRecipes[recipe][0]) || 0
        );
      }
      if (InventoryManager.inventoryKnows(cookingRecipes[recipe][1])) {
        Items.fillItemSlot(
          recipeRow.querySelectorAll('.slot.item-' + cookingRecipes[recipe][1]),
          InventoryManager.inventoryItemAmount(cookingRecipes[recipe][1]) || 0
        );
      }
      if (
        InventoryManager.inventoryKnows(cookingRecipes[recipe][0]) &&
        InventoryManager.inventoryKnows(cookingRecipes[recipe][1])
      ) {
        const actionSlot = recipeRow.querySelector('.slot.action.item-' + recipe);
        if (!actionSlot) {
          continue;
        }
        actionSlot.classList.remove('unknown');
        if (
          !InventoryManager.inventoryContains(cookingRecipes[recipe][0]) ||
          !InventoryManager.inventoryContains(cookingRecipes[recipe][1])
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
        }, 100);
      }
    }
  },
};
