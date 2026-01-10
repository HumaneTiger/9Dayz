import Props from './props.js';
import Items from './items.js';
import Audio from './audio.js';
import RecipeDefinitions from '../data/definitions/recipe-definitions.js';
import Events, { EVENTS } from './events.js';

const cookingRecipes = RecipeDefinitions.cookingRecipes;

export default {
  init: function () {
    document.body.addEventListener('mousedown', this.checkForCardClick.bind(this));

    // EVENT: React to inventory changes
    Events.on(EVENTS.INVENTORY_CHANGED, () => {
      this.checkAllCookingModeCards();
    });
  },

  start: function (cardRef) {
    this.checkCookingRecipePrerequisits(cardRef);
    cardRef.classList.add('cooking-mode');
    window.setTimeout(() => {
      cardRef.classList.add('full');
    }, 100);
  },

  end: function (cardRef) {
    if (cardRef.classList.contains('cooking-mode')) {
      cardRef.classList.remove('full');
      window.setTimeout(() => {
        cardRef.classList.remove('cooking-mode');
      }, 100);
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
        // having something like resolveRecipeIngredients would be helpful here
        if (recipe) {
          Props.addItemToInventory(recipe, cookingRecipes[recipe][2]);
          Audio.sfx('roast');
          if (recipe === 'glue') {
            // remove bone
            Props.addItemToInventory(cookingRecipes[recipe][0], -1);
            // remove one water
            Items.inventoryContains('drink-1')
              ? Props.addItemToInventory('drink-1', -1)
              : Props.addItemToInventory('drink-2', -1);
          } else if (recipe === 'roasted-mushroom') {
            Items.inventoryContains('mushroom-1')
              ? Props.addItemToInventory('mushroom-1', -1)
              : Props.addItemToInventory('mushroom-2', -1);
          } else {
            Props.addItemToInventory(cookingRecipes[recipe][0], -1);
          }
        }
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
