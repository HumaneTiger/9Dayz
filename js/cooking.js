import Props from './props.js'
import Items from './items.js'

let cookingRecipes = Props.getCookingRecipes();

export default {
  
  init: function() {
    document.body.addEventListener('click', this.checkForCardClick.bind(this));
  },

  start: function(cardRef) {
    this.checkCookingRecipePrerequisits(cardRef);
    cardRef.classList.add('cooking-mode');
    window.setTimeout(() => {cardRef.classList.add('full');}, 100);
  },

  end: function(cardRef) {
    if (cardRef.classList.contains('cooking-mode')) {
      cardRef.classList.remove('full');
      window.setTimeout(() => {cardRef.classList.remove('cooking-mode');}, 100);  
    }
  },

  checkAllCookingModeCards: function() {
    let allCardRefs = document.querySelectorAll('#cards .card.cooking-mode');
    for (let i = 0; i < allCardRefs.length; i += 1) {
      this.checkCookingRecipePrerequisits(allCardRefs[i]);
    }
  },

  checkCookingRecipePrerequisits: function(cardRef) {
    for (const recipe in cookingRecipes) {
      if (Items.inventoryKnows(cookingRecipes[recipe][0])) {
        Items.fillItemSlot(cardRef.querySelectorAll('.slot.item-' + cookingRecipes[recipe][0]), (Items.inventoryItemAmount(cookingRecipes[recipe][0]) || 0));
      }
      if (Items.inventoryKnows(cookingRecipes[recipe][1])) {
        Items.fillItemSlot(cardRef.querySelectorAll('.slot.item-' + cookingRecipes[recipe][1]), (Items.inventoryItemAmount(cookingRecipes[recipe][1]) || 0));
      }
      if (Items.inventoryKnows(cookingRecipes[recipe][0]) && Items.inventoryKnows(cookingRecipes[recipe][1])) {
        if (!Items.inventoryKnows(recipe)) {
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.remove('unknown');
        }
        if (!Items.inventoryContains(cookingRecipes[recipe][0]) || !Items.inventoryContains(cookingRecipes[recipe][1])) {
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.remove('active');
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.add('inactive');
        } else {
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.remove('inactive');
          cardRef.querySelector('.slot.action.item-' + recipe)?.classList.add('active');
        }
      }
    }
  },

  checkForCardClick: function(ev) {
    const target = ev.target;
    const actionButton = target.closest('div.action-button');
    const actionSlotActive = target.closest('div.slot.action.active');
    const cookingContainer = target.closest('.card.cooking-mode');
    if (cookingContainer) {
      if (actionSlotActive) {
        const recipe = actionSlotActive.dataset?.item;
        if (recipe) {
          Props.addToInventory(recipe, cookingRecipes[recipe][2]);
          if (recipe === 'glue') {
            Props.addToInventory(cookingRecipes[recipe][0], -1);
            Items.inventoryContains('drink-1') ? Props.addToInventory('drink-1', -1) : Props.addToInventory('drink-2', -1);
          } else if (recipe === 'roasted-mushroom') {
            Items.inventoryContains('mushroom-1') ? Props.addToInventory('mushroom-1', -1) : Props.addToInventory('mushroom-2', -1);
          } else {
            Props.addToInventory(cookingRecipes[recipe][0], -1);  
          }
        }
        Items.inventoryChangeFeedback();
        Items.fillInventorySlots();            
      } else if (actionButton && actionButton.dataset.action === 'close-cooking') {
        cookingContainer.classList.remove('full');
        window.setTimeout(() => {cookingContainer.classList.remove('cooking-mode');}, 100);
      }
    }
  }
}