import Props from './props.js'
import Items from './items.js'

export default {
  
  init: function() {
  },

  start: function(cardRef) {
    this.checkCookingRecipePrerequisits(cardRef);
    cardRef.classList.add('cooking-mode');
    window.setTimeout(() => {cardRef.classList.add('full');}, 100);
    /* set back other fireplace cooking modes */
    /* there can cook only one! */
  },

  checkAllCookingModeCards: function() {
    let allCardRefs = document.querySelectorAll('#cards .card.cooking-mode');
    for (let i = 0; i < allCardRefs.length; i += 1) {
      this.checkCookingRecipePrerequisits(allCardRefs[i]);
    }
  },

  checkCookingRecipePrerequisits: function(cardRef) {
    let cookingRecipes = Props.getCookingRecipes();
    for (const recipe in cookingRecipes) {
      if (Items.inventoryKnows(cookingRecipes[recipe][0])) {
        Items.fillItemSlot(cardRef.querySelectorAll('.slot.item-' + cookingRecipes[recipe][0]), (Items.inventoryItemAmount(cookingRecipes[recipe][0]) || 0));
      }
      if (Items.inventoryKnows(cookingRecipes[recipe][1])) {
        Items.fillItemSlot(cardRef.querySelectorAll('.slot.item-' + cookingRecipes[recipe][1]), (Items.inventoryItemAmount(cookingRecipes[recipe][1]) || 0));
      }
      if (Items.inventoryKnows(cookingRecipes[recipe][0]) && Items.inventoryKnows(cookingRecipes[recipe][1])) {
        if (!Items.inventoryKnows(recipe)) {
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.remove('unknown', 'inactive');
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.add('active');
        }
        if (!Items.inventoryContains(cookingRecipes[recipe][0]) || !Items.inventoryContains(cookingRecipes[recipe][1])) {
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.remove('active');
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.add('inactive');
        }
      }
    }
  }

  /*
    else if (item === 'roast') {
    if (inventory.items['meat']?.amount > 0) {
      Props.addToInventory('roasted-meat', 1);
      Props.addToInventory('meat', -1);
    }
    if (inventory.items['pepper']?.amount > 0) {
      Props.addToInventory('roasted-pepper', 1);
      Props.addToInventory('pepper', -1);
    }
    if (inventory.items['mushroom-2']?.amount > 0) {
      Props.addToInventory('roasted-mushroom', 1);
      Props.addToInventory('mushroom-2', -1);
    }
    this.inventoryChangeFeedback();
    this.fillInventorySlots();
  */
}