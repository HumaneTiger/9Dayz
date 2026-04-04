// @ts-check

/**
 * @typedef {Object} CharacterDefinition
 * @property {Record<string, number>} [inventoryPreset]
 * @property {Record<string, number[]>} [itemModifiers]
 * @property {string} descriptionMarkup
 * @export
 */

/** @type {Record<string, CharacterDefinition>} */
export default {
  everyman: {
    inventoryPreset: {
      tomato: 2,
      'drink-2': 1,
      'snack-1': 1,
      knife: 1,
      'energy-pills': 1,
      pepper: 1,
    },
    descriptionMarkup: `
    <p>
      It is nothing short of a miracle that this very ordinary person survived.
      For the first time in their life this lucky one isn't part of the mainstreamers, who are walking undead in the streets now.
    </p>
    <p>
      This is also the character you play in the Tutorial. Ideal for your first runs to get more familiar with the world of 9 Dayz.
    </p>
    <p class="nerf">
      No recognizable weaknesses
    </p>
    <p class="buff">
      No special strengths or skills
    </p>`,
  },

  treehugger: {
    inventoryPreset: {
      'mushroom-1': 2,
      acorn: 1,
      branch: 1,
      'fruit-2': 2,
      knife: 1,
    },
    descriptionMarkup: `
    <p>
      Your character has a particular affinity for nature and the natural world.
    </p>
    <p class="nerf">
      <span class="keyword" data-content="food">Food</span> and <span class="keyword" data-content="energy">energy</span> bonus from all <span class="keyword" data-item="fruit-2">fruits</span>, <span class="keyword" data-item="acorn">nuts</span>, <span class="keyword" data-item="meat">meat</span> and <span class="keyword" data-item="mushroom-1">vegetables</span>
    </p>
    <p class="nerf">
      Lucky with gathering natural resources
    </p>
    <p class="nerf">
      Can sleep at a <span class="keyword" data-content="fireplace">Fireplace</span>, Bonus for resting under trees
    </p>
    <p class="buff">
      Unlucky when searching buildings and vehicles
    </p>
    <p class="buff">
      Penalty when eating processed food
    </p>
    <p class="buff">
      Penalty when sleeping in buildings or cars
    </p>`,
    itemModifiers: {
      acorn: [2, 0, 0],
      'fruit-bread': [-15, 0, -10],
      'bread-2': [-20, 0, -10],
      carrot: [4, 2, 0],
      'drink-1': [0, 0, 0],
      'drink-2': [0, 0, 0],
      'drink-3': [-3, -10, -3],
      'drink-4': [-3, -10, -3],
      'drink-5': [-5, -10, -5],
      'fruit-1': [3, 5, 5],
      'fruit-2': [3, 5, 5],
      'fruit-3': [3, 5, 5],
      'energy-pills': [0, 0, -25],
      hawthorn: [3, 5, 3],
      meat: [3, 3, 5],
      'roasted-meat': [10, 5, 10],
      pepper: [5, 5, 5],
      'roasted-pepper': [5, 5, 5],
      physalis: [2, 3, 2],
      pumpkin: [5, 5, 10],
      'roasted-pumpkin': [4, 3, 4],
      rosehip: [2, 2, 4],
      'mushroom-1': [2, 2, 4],
      'mushroom-2': [2, 2, 4],
      'roasted-mushroom': [2, 3, 5],
      'snack-1': [-15, 0, -8],
      'snack-2': [-15, 0, -8],
      tomato: [4, 5, 7],
    },
  },

  snackivore: {
    inventoryPreset: {
      'snack-1': 3,
      'drink-5': 1,
      'snack-2': 1,
    },
    descriptionMarkup: `
    <p>
      In past times your character used to constantly snack throughout the day.
    </p>
    <p class="nerf">
      Bonuses for all stats from <span class="keyword" data-item="snack-1">snacks</span>, <span class="keyword" data-item="drink-5">soda drinks</span> and <span class="keyword" data-item="roasted-meat">roasted meat</span>
    </p>
    <p class="nerf">
      In <span class="keyword" data-content="battle">battles</span> all natural food items deal +1 damage (you happily let them go)
    </p>
    <p class="buff">
      Unlucky when searching trees and fields
    </p>
    <p class="buff">
      Penalty when eating all kinds of natural food
    </p>
    <p class="buff">
      Your untrained body consumes more <span class="keyword" data-content="energy">energy</span>, <span class="keyword" data-content="food">calories</span> and <span class="keyword" data-content="thirst">water</span>
    </p>
    <p class="buff">
      Won't drink from lakes and wells
    </p>`,
    itemModifiers: {
      acorn: [-1, 0, 0],
      'fruit-bread': [5, 0, 10],
      'bread-2': [5, 0, 10],
      carrot: [-4, -2, 0],
      'drink-3': [10, 20, 10],
      'drink-4': [10, 20, 10],
      'drink-5': [15, 30, 15],
      'fruit-1': [-2, -4, -2],
      'fruit-2': [-2, -4, -2],
      'fruit-3': [-2, -4, -2],
      'energy-pills': [0, 0, +25],
      hawthorn: [-2, -2, 0],
      meat: [-3, -5, 0],
      'roasted-meat': [15, 15, 20],
      pepper: [-4, -2, 0],
      'roasted-pepper': [-5, -5, -5],
      physalis: [-2, -2, 0],
      pumpkin: [-10, -10, -10],
      'roasted-pumpkin': [-5, -5, -5],
      rosehip: [-2, -2, 0],
      'mushroom-1': [-2, -2, 0],
      'mushroom-2': [-4, -3, 0],
      'roasted-mushroom': [1, 1, 1],
      'snack-1': [20, 0, 25],
      'snack-2': [20, 0, 25],
      tomato: [-2, -4, -3],
    },
  },

  craftsmaniac: {
    inventoryPreset: {
      fail: 1,
      tape: 1,
      knife: 1,
      'drink-2': 1,
      pincers: 1,
      nails: 1,
    },
    descriptionMarkup: `
    <p>
      As a former construction side worker and passionated home improver, your character is proficient in all kinds of handcrafting work.
    </p>
    <p class="nerf">
      Start with some <span class="keyword" data-item="spanner">tools</span> in your pockets
    </p>
    <p class="nerf">
      Lucky when searching vehicles, basements, sheds and garages
    </p>
    <p class="nerf">
      Repairing weapons occasionally preserves required materials
    </p>
    <p class="buff">
      Will spare their <span class="keyword" data-item="spanner">tools</span> in <span class="keyword" data-content="battle">battles</span> against enemies
    </p>
    <p class="buff">
      Ain't no <span class="keyword" data-content="fireplace">cooking</span> - it's a craftsman not a chef (needs rework)
    </p>`,
  },

  furbuddy: {
    inventoryPreset: {
      'drink-2': 1,
      'snack-1': 1,
      knife: 1,
      'energy-pills': 1,
      meat: 2,
      bones: 2,
    },
    descriptionMarkup: `
    <p>
      Your character adores and cares deeply for animals and enjoys spending time with them.
    </p>
    <p class="nerf">
      Starts with a 🐶 dog companion
    </p>
    <p class="nerf">
      Is joined by his dog in battles
    </p>
    <p class="buff">
      Suffers damage when cutting animals - it's just wrong
    </p>
    <p class="buff">
      Won't eat meat and won't use meat or bones in battles - these are for the dog
    </p>`,
  },

  hardcharger: {
    inventoryPreset: {},
    descriptionMarkup: `
    <p>
      Your character is a tough and driven person with a military background, aggressive and tenacious in their approach.
    </p>
    <p class="nerf">
      In fights you can attack with bare fists
    </p>
    <p class="nerf">
      No Action Points penalty when energy is low
    </p>
    <p class="nerf">
      You can break doors and locks with sheer force
    </p>
    <p class="buff">
      Your muscled body needs much more energy, food, sleep and water
    </p>`,
  },

  cashmeister: {
    inventoryPreset: {},
    descriptionMarkup: `
    <p>
      As a banker you dealed with big money professionally. These days, your skills, values and attitudes are the least wanted and needed of all.
    </p>
    <p class="nerf">
      Start with your pockets full of money
    </p>
    <p class="nerf">
      You will find money in houses
    </p>
    <p class="buff">
      Never had to get your hands dirty, so you will find less loot, can't repair weapons and can't cook
    </p>
    <p class="buff">
      Animals sense your dishonest nature and will refuse to join you
    </p>
    <p class="buff">
      Your money stinks - Undead and other creatures sense you and will attack first
    </p>`,
  },
};
