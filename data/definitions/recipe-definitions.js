// @ts-check

/**
 * @typedef {[string, string, number, string]} CookingRecipe
 * Tuple: [primaryIngredient, secondaryIngredient, quantity, method]
 * @export
 */

/**
 * @typedef {Object} CraftingRecipe
 * @property {string[][]} items - List of ingredients needed, including alternatives (e.g. [['fail', 'hacksaw'], ['stump']])
 * @property {boolean} exclusive - Whether ingredients are consumed or reusable
 * @property {string} result - Result type (weapon, building, inventory)
 * @property {number} [amount] - Optional: quantity of result items created
 * @export
 */

/**
 * @typedef {Record<string, string[]>} IngredientVariants
 * @export
 */

export default {
  persistentIngredients: ['knife', 'sharp-stick'],

  ingredientVariants: {
    water: ['drink-1', 'drink-2'],
    mushrooms: ['mushroom-1', 'mushroom-2'],
    fruits: ['fruit-1', 'fruit-2', 'fruit-3'],
  },

  /** @type {Record<string, CookingRecipe>} */
  cookingRecipes: {
    'roasted-meat': ['meat', 'sharp-stick', 1, 'roast'],
    'roasted-pepper': ['pepper', 'sharp-stick', 1, 'roast'],
    'roasted-mushroom': ['mushrooms', 'sharp-stick', 1, 'roast'],
    'roasted-pumpkin': ['pumpkin', 'knife', 4, 'roast'],
    glue: ['bones', 'water', 1, 'cook'],
    stew: ['meat', 'fruits', 1, 'cook'],
    tea: ['rosehip', 'water', 1, 'cook'],
    flour: ['acorn', 'mallet', 1, 'crush'],
    dough: ['flour', 'water', 1, 'mix'],
    porridge: ['hawthorn', 'dough', 1, 'cook'],
    'fruit-bread': ['fruits', 'dough', 1, 'bake'],
    cookie: ['honey', 'dough', 3, 'bake'],
  },

  /** @type {Record<string, CraftingRecipe>} */
  craftingRecipes: {
    'wooden-club': {
      items: [['fail', 'hacksaw'], ['stump']],
      exclusive: true,
      result: 'weapon',
    },
    'improvised-axe': {
      items: [['tape'], ['branch'], ['stone']],
      exclusive: true,
      result: 'weapon',
    },
    'improvised-whip': {
      items: [['rope'], ['branch']],
      exclusive: true,
      result: 'weapon',
    },
    'fishing-rod': {
      items: [['rope'], ['branch'], ['bone-hook']],
      exclusive: true,
      result: 'weapon',
    },
    fireplace: {
      items: [['stone'], ['stump'], ['straw-wheet']],
      exclusive: false,
      result: 'building',
    },
    barricades: {
      items: [['rope'], ['stump'], ['sharp-stick']],
      exclusive: false,
      result: 'building',
    },
    tape: {
      items: [['cloth'], ['glue']],
      exclusive: false,
      amount: 2,
      result: 'inventory',
    },
    'sharp-stick': {
      items: [['branch'], ['knife']],
      exclusive: false,
      result: 'inventory',
    },
    'bone-hook': {
      items: [['bones'], ['knife']],
      exclusive: false,
      result: 'inventory',
    },
    rope: {
      items: [['straw-wheet'], ['straw-wheet']],
      exclusive: false,
      result: 'inventory',
    },
  },
};
