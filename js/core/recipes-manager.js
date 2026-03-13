// @ts-check
/**
 * @import { CookingRecipe, CraftingRecipe, IngredientVariants } from '../../data/definitions/recipe-definitions.js'
 */

import { RecipeDefinitions } from '../../data/index.js';
import { InventoryManager } from './index.js';

const cookingRecipes = RecipeDefinitions.cookingRecipes;
const craftingRecipes = RecipeDefinitions.craftingRecipes;

export default {
  /** @returns {Record<string, CookingRecipe>} */
  getCookingRecipes: function () {
    return cookingRecipes;
  },

  /** @returns {IngredientVariants} */
  getIngredientVariants: function () {
    return RecipeDefinitions.ingredientVariants;
  },

  /** @returns {string[]} */
  getPersistentIngredients: function () {
    return RecipeDefinitions.persistentIngredients;
  },

  /**
   * @param {string} item
   * @returns {boolean} */
  isItemPartOfRecipe: function (item) {
    for (const recipe in cookingRecipes) {
      if (item === cookingRecipes[recipe][0] || item === cookingRecipes[recipe][1]) {
        return true;
      }
    }
    return false;
  },

  /**
   * @param {string} recipeName
   * @returns {string[]} */
  getIngredientsForCookingRecipe: function (recipeName) {
    return [cookingRecipes[recipeName][0], cookingRecipes[recipeName][1]];
  },

  /**
   * @param {string} recipeName
   * @returns {string} */
  getCookingMethod: function (recipeName) {
    return cookingRecipes[recipeName][3];
  },

  /**
   * @param {string} recipeName
   * @returns {number} */
  getCookingResultAmount: function (recipeName) {
    return cookingRecipes[recipeName][2];
  },

  /**
   * @param {string} recipeName
   * @returns {void} */
  resolveRecipeIngredients: function (recipeName) {
    if (!recipeName) {
      return;
    }

    // Add result to inventory
    InventoryManager.addItemToInventory(recipeName, this.getCookingResultAmount(recipeName));

    // Get ingredients for this recipe
    const ingredients = this.getIngredientsForCookingRecipe(recipeName);
    const persistentIngredients = this.getPersistentIngredients();
    const ingredientVariants = this.getIngredientVariants();

    // Remove each ingredient based on definitions
    ingredients.forEach(ingredient => {
      // Skip persistent ingredients
      if (persistentIngredients.includes(ingredient)) {
        return;
      }

      /** @type {string | undefined} */
      let itemToRemove = ingredient;

      // Check if ingredient is a variant key (generic name)
      if (ingredientVariants[ingredient]) {
        // Find which variant is in inventory
        itemToRemove = ingredientVariants[ingredient].find(variant =>
          InventoryManager.inventoryContains(variant)
        );
      }

      // Remove the ingredient
      if (itemToRemove) {
        InventoryManager.addItemToInventory(itemToRemove, -1);
      }
    });
  },

  /** @returns {Record<string, CraftingRecipe>} */
  getCraftingRecipes: function () {
    return craftingRecipes;
  },

  /**
   * @param {string} recipeName
   * @returns {string[]} */
  getIngredientsForCraftingRecipe: function (recipeName) {
    return craftingRecipes[recipeName].items.flat();
  },

  /**
   * @param {string} itemName
   * @returns {boolean} */
  isItemPartOfCraftingRecipe: function (itemName) {
    for (const recipe in craftingRecipes) {
      if (
        craftingRecipes[recipe].items[0]?.includes(itemName) ||
        craftingRecipes[recipe].items[1]?.includes(itemName) ||
        craftingRecipes[recipe].items[2]?.includes(itemName)
      ) {
        return true;
      }
    }
    return false;
  },

  numberOfActiveCookingRecipes: function () {
    const recipes = this.getCookingRecipes();
    let count = 0;

    for (const recipe in recipes) {
      const ingredient1 = recipes[recipe][0];
      const ingredient2 = recipes[recipe][1];

      if (
        InventoryManager.inventoryKnows(ingredient1) &&
        InventoryManager.inventoryKnows(ingredient2) &&
        InventoryManager.inventoryContains(ingredient1) &&
        InventoryManager.inventoryContains(ingredient2)
      ) {
        count++;
      }
    }

    return count;
  },

  /**
   *
   * @param {string} recipeName
   * @returns {boolean}
   */
  isCraftingPrerequisitsFulfilled: function (recipeName) {
    const recipe = craftingRecipes[recipeName];
    if (!recipe) {
      return false;
    }

    for (const ingredientGroup of recipe.items) {
      let groupFulfilled = false;
      for (const ingredient of ingredientGroup) {
        if (InventoryManager.inventoryContains(ingredient)) {
          groupFulfilled = true;
          break;
        }
      }
      if (!groupFulfilled) {
        return false;
      }
    }

    return true;
  },

  /**
   *
   * @param {number} page
   * @returns {string[]}
   */
  getCraftingRecipesForPage: function (page) {
    const recipes = this.getCraftingRecipes();
    const recipeList = [];
    for (const recipe in recipes) {
      if (recipes[recipe].page === page) {
        recipeList.push(recipe);
      }
    }
    return recipeList;
  },

  /**
   *
   * @param {number} page
   * @returns {number}
   */
  numberOfActiveCraftingRecipes: function (page) {
    let count = 0;
    const recipeList = this.getCraftingRecipesForPage(page);
    for (const recipeName of recipeList) {
      if (this.isCraftingPrerequisitsFulfilled(recipeName)) {
        count++;
      }
    }

    return count;
  },
};
