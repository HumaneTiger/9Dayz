import Props from './props.js';

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
    const buildingProps = Props.getBuildingProps();
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
    const items = Props.getAllItems();
    const loader = new ImagePreloader('./img/');
    for (const prop in items) {
      loader.load(prop, 'items/' + prop + '.PNG');
    }
  },

  preloadWeapons: function () {
    const weapons = Props.getAllWeapons();
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
  },

  preloadZombies: function () {
    const loader = new ImagePreloader('./img/zombies/');
    loader.load(1, 'zombie-1.png');
    loader.load(2, 'zombie-2.png');
    loader.load(3, 'zombie-3.png');
    loader.load(4, 'scratch.png');
    loader.load(5, 'rat.png');
    loader.load(6, 'bee.png');
    loader.load(7, 'undead.png');
    loader.load(8, 'dead.png');
  },

  preloadTutorial: function () {
    const loader = new ImagePreloader('./img/tutorial/');
    loader.load(1, 'note-1.png');
    loader.load(2, 'note-2.png');
    loader.load(3, 'note-3.png');
    loader.load(4, 'note-4.png');
    loader.load(5, 'step-1.png');
    loader.load(6, 'step-2.png');
    loader.load(7, 'step-3.png');
    loader.load(8, 'step-4.png');
    loader.load(9, 'step-5.png');
    loader.load(10, 'general-notes.png');
    loader.load(11, 'letter-blank.png');
  },
};
