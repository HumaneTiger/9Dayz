import Props from './props.js';
import Items from './items.js';
import Audio from './audio.js';
import RecipeDefinitions from '../data/definitions/recipe-definitions.js';
import Events, { EVENTS } from './events.js';
import TimingUtils from './utils/timing-utils.js';

const cookingRecipes = RecipeDefinitions.cookingRecipes;

export default {
  init: function () {
    document.body.addEventListener('mousedown', this.checkForCardClick.bind(this));

    // EVENT: React to inventory changes
    Events.on(EVENTS.INVENTORY_CHANGED, () => {
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
    for (const recipe in cookingRecipes) {
      if (Items.inventoryKnows(cookingRecipes[recipe][0])) {
        Items.fillItemSlot(
          cardRef.querySelectorAll('.slot.item-' + cookingRecipes[recipe][0]),
          Items.inventoryItemAmount(cookingRecipes[recipe][0]) || 0
        );
      }
      if (Items.inventoryKnows(cookingRecipes[recipe][1])) {
        Items.fillItemSlot(
          cardRef.querySelectorAll('.slot.item-' + cookingRecipes[recipe][1]),
          Items.inventoryItemAmount(cookingRecipes[recipe][1]) || 0
        );
      }
      if (
        Items.inventoryKnows(cookingRecipes[recipe][0]) &&
        Items.inventoryKnows(cookingRecipes[recipe][1])
      ) {
        cardRef.querySelector('.slot.action.item-' + recipe)?.classList.remove('unknown');
        if (
          !Items.inventoryContains(cookingRecipes[recipe][0]) ||
          !Items.inventoryContains(cookingRecipes[recipe][1])
        ) {
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.remove('active');
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.add('inactive');
        } else {
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.remove('inactive');
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.add('active');
        }
      }
    }
  },

  isItemPartOfRecipe: function (item) {
    for (const recipe in cookingRecipes) {
      if (item === cookingRecipes[recipe][0] || item === cookingRecipes[recipe][1]) {
        return true;
      }
    }
    return false;
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
        this.resolveRecipeIngredients(recipe);
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

  resolveRecipeIngredients: function (recipe) {
    if (!recipe) {
      return;
    }

    // Add result to inventory
    Props.addItemToInventory(recipe, cookingRecipes[recipe][2]);
    Audio.sfx('roast');

    // Get ingredients for this recipe
    const ingredients = [cookingRecipes[recipe][0], cookingRecipes[recipe][1]];

    // Remove each ingredient based on definitions
    ingredients.forEach(ingredient => {
      // Skip persistent ingredients
      if (RecipeDefinitions.persistentIngredients.includes(ingredient)) {
        return;
      }

      let itemToRemove = ingredient;

      // Check if ingredient is a variant key (generic name)
      if (RecipeDefinitions.ingredientVariants[ingredient]) {
        // Find which variant is in inventory
        itemToRemove = RecipeDefinitions.ingredientVariants[ingredient].find(variant =>
          Items.inventoryContains(variant)
        );
      }

      // Remove the ingredient
      if (itemToRemove) {
        Props.addItemToInventory(itemToRemove, -1);
      }
    });
  },
};
