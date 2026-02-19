// @ts-check

/**
 * @typedef {[string, number, number, number, number?, number?]} ItemDefinition
 * @export
 */

/**
 * @typedef {Object} ItemProps
 * @property {string} name
 * @property {string} type
 * @property {number} damage
 * @property {number} protection
 * @property {number} food
 * @property {number} drink
 * @property {number} energy
 * @export
 */

/**
 * @typedef {ItemProps & {amount: number}} Item
 * @export
 */

/* ['type', hunger, thirst, energy, attack, defense] */
/** @type {Record<string, ItemDefinition>} */
const items = {
  acorn: ['eat', 1, 0, 0],
  rosehip: ['eat', 2, 2, 0],
  hawthorn: ['eat', 2, 2, 0],
  physalis: ['eat', 2, 2, 0],
  branch: ['craft', 0, 0, 0, 1, 1],
  stone: ['craft', 0, 0, 0, 4, 1],
  'straw-wheet': ['craft', 0, 0, 0, 0, 0],
  stump: ['craft', 0, 0, 0, 3, 3],
  reef: ['craft', 0, 0, 0, 1, 1],
  'fruit-1': ['eat', 2, 8, 2],
  'fruit-2': ['eat', 4, 8, 2],
  'fruit-3': ['eat', 3, 8, 2],
  'mushroom-1': ['eat', 2, 2, 0],
  'mushroom-2': ['eat', 4, 3, 0],
  'roasted-mushroom': ['eat', 11, 5, 10],
  pumpkin: ['eat', 15, 15, 10],
  'roasted-pumpkin': ['eat', 8, 6, 7],
  pepper: ['eat', 8, 5, 0],
  'roasted-pepper': ['eat', 22, 5, 20],
  meat: ['eat', 3, 5, 0],
  'roasted-meat': ['eat', 30, 15, 25],
  tomato: ['eat', 4, 8, 3],
  carrot: ['eat', 6, 4, 0],
  'drink-1': ['drink', 0, 30, 0],
  'drink-2': ['drink', 0, 35, 0],
  'drink-3': ['drink', 5, 25, 5],
  'drink-4': ['drink', 5, 25, 5],
  'drink-5': ['drink', 10, 30, 10],
  'snack-1': ['eat', 25, 0, 10],
  'snack-2': ['eat', 25, 0, 10],
  'fruit-bread': ['eat', 45, 0, 20],
  'bread-2': ['eat', 40, 0, 20],
  cookie: ['eat', 8, 0, 12, 3, 2],
  wine: ['drink', 5, 35, 20],
  honey: ['eat', 15, 5, 25, 3, 2],
  porridge: ['eat', 35, 20, 30],
  tea: ['drink', 0, 30, 15],
  stew: ['eat', 40, 25, 35],
  dough: ['craft', 0, 0, 0, 1, 2],
  flour: ['craft', 0, 0, 0, 1, 2],
  'energy-pills': ['eat', 0, 0, 50, 1, 1],
  bones: ['craft', 0, 0, 0, 2, 0],
  cloth: ['craft', 0, 0, 0, 4, 2],
  glue: ['craft', 0, 0, 0, 5, 2],
  knife: ['craft', 0, 0, 0, 4, 1],
  fail: ['craft', 0, 0, 0, 3, 2],
  hacksaw: ['craft', 0, 0, 0, 3, 2],
  tape: ['craft', 0, 0, 0, 1, 0],
  'sharp-stick': ['craft', 0, 0, 0, 3, 3],
  pincers: ['craft', 0, 0, 0, 3, 2],
  spanner: ['craft', 0, 0, 0, 3, 1],
  nails: ['craft', 0, 0, 0, 2, 1],
  books: ['craft', 0, 0, 0, 0, 2],
  claw: ['craft', 0, 0, 0, 4, 2],
  exodus: ['craft', 0, 0, 0, 4, 2],
  mallet: ['craft', 0, 0, 0, 5, 1],
  rope: ['craft', 0, 0, 0, 3, 1],
  'bone-hook': ['craft', 0, 0, 0, 2, 2],
  key: ['craft', 0, 0, 0, 1, 1],
};

export default {
  items,
};
