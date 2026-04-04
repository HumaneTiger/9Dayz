import { ObjectFactory, InventoryManager, WeaponsManager } from './core/index.js';

class ImagePreloader {
  constructor(pathPrefix) {
    this.pathPrefix = pathPrefix;
    this.images = [];
  }

  load(key, filename) {
    this.images[key] = new Image();
    this.images[key].src = this.pathPrefix + filename;
    return this;
  }

  loadMultiple(items) {
    for (const item of items) {
      this.load(item, item + '.png');
    }
    return this;
  }
}

export default {
  init: function () {
    this.preloadBuildings();
    this.preloadItems();
    this.preloadWeapons();
    this.preloadUI();
    this.preloadZombies();
  },

  preloadBuildings: function () {
    const buildingProps = ObjectFactory.getBuildingProps();
    const loader = new ImagePreloader('./img/buildings/');

    for (const prop in buildingProps) {
      if (prop.startsWith('signpost-')) {
        loader.load(prop, 'signpost.png');
      } else if (prop === 'small-tree') {
        loader.load(prop, 'small-tree-1.png');
        loader.load(prop, 'small-tree-2.png');
      } else if (prop === 'big-tree') {
        loader.load(prop, 'big-tree-1.png');
        loader.load(prop, 'big-tree-2.png');
      } else if (prop === 'field') {
        loader.load(prop, 'field-1.png');
        loader.load(prop, 'field-2.png');
      } else {
        loader.load(prop, prop + '.png');
      }
    }
  },

  preloadItems: function () {
    const items = InventoryManager.getAllItems();
    const loader = new ImagePreloader('./img/');
    for (const prop in items) {
      loader.load(prop, 'items/' + prop + '.PNG');
    }
  },

  preloadWeapons: function () {
    const weapons = WeaponsManager.getAllWeapons();
    const loader = new ImagePreloader('./img/');
    for (const prop in weapons) {
      loader.load(prop, 'weapons/' + prop + '.png');
    }
  },

  preloadUI: function () {
    const loader = new ImagePreloader('./img/');
    loader.load(1, 'ui/logo.png');
    loader.load(2, 'card/card-bg.png');
    loader.load(3, 'card/card-bg-z.png');
    loader.load(4, 'card/border-house.png');
    loader.load(5, 'card/border-weapon.png');
    loader.load(6, 'card/card-back.png');
    loader.load(7, 'card/border-neutral.png');
    loader.load(8, 'card/border-z.png');
    loader.load(9, 'tutorial/letter-blank.png');
    loader.load(10, 'card/chip.png');
    loader.load(11, 'card/chip-border-neutral.png');
    loader.load(12, 'characters/hero.png');
    loader.load(13, 'ui/day-teaser-left.png');
    loader.load(14, 'ui/day-teaser-right.png');
    loader.load(15, 'ui/crafting-1.png');
    loader.load(16, 'ui/crafting-2.png');
    loader.load(17, 'ui/action-points.png');
    loader.load(18, 'ui/you.png');
  },

  preloadZombies: function () {
    const loader = new ImagePreloader('./img/zombies/');
    loader.load(1, 'zombie-1.png');
    loader.load(2, 'zombie-2.png');
    loader.load(3, 'zombie-3.png');
    loader.load(4, 'zombie-4.png');
    loader.load(5, 'scratch.png');
    loader.load(6, 'rat.png');
    loader.load(7, 'bee.png');
    loader.load(8, 'undead.png');
    loader.load(9, 'dead.png');
  },

  preloadTutorial: function () {
    const loader = new ImagePreloader('./img/tutorial/');
    loader.load(1, 'intro-step-1.png');
    loader.load(2, 'intro-step-2.png');
    loader.load(3, 'intro-step-3.png');
    loader.load(4, 'note-1.png');
    loader.load(5, 'note-2.png');
    loader.load(6, 'note-3.png');
    loader.load(7, 'note-4.png');
    loader.load(8, 'step-1.png');
    loader.load(9, 'step-2.png');
    loader.load(10, 'step-3.png');
    loader.load(11, 'step-4.png');
    loader.load(12, 'step-4a.png');
    loader.load(13, 'step-5.png');
    loader.load(14, 'general-notes.png');
    loader.load(15, 'letter-blank.png');
  },
};
