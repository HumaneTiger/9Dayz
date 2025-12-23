import Props from './props.js';

export default {
  init: function () {
    this.preloadBuildings();
    this.preloadItems();
    this.preloadUI();
    this.preloadZombies();
  },

  preloadBuildings: function () {
    const buildingProps = Props.getBuildingProps();
    let images = [];
    for (const prop in buildingProps) {
      images[prop] = new Image();
      if (prop.startsWith('signpost-')) {
        images[prop].src = './img/buildings/signpost.png';
      } else if (prop === 'small-tree') {
        images[prop].src = './img/buildings/small-tree-1.png';
        images[prop] = new Image();
        images[prop].src = './img/buildings/small-tree-2.png';
      } else if (prop === 'big-tree') {
        images[prop].src = './img/buildings/big-tree-1.png';
        images[prop] = new Image();
        images[prop].src = './img/buildings/big-tree-2.png';
      } else if (prop === 'field') {
        images[prop].src = './img/buildings/field-1.png';
        images[prop] = new Image();
        images[prop].src = './img/buildings/field-2.png';
      } else {
        images[prop].src = './img/buildings/' + prop + '.png';
      }
    }
  },

  preloadItems: function () {
    const items = Props.getAllItems();
    let images = [];
    for (const prop in items) {
      images[prop] = new Image();
      if (items[prop][0] !== 'extra') {
        images[prop].src = './img/items/' + prop + '.PNG';
      } else {
        images[prop].src = './img/weapons/' + prop + '.png';
      }
    }
  },

  preloadUI: function () {
    let images = [];
    images[1] = new Image();
    images[1].src = './img/ui/logo.png';
    images[2] = new Image();
    images[2].src = './img/card/card-bg.png';
    images[3] = new Image();
    images[3].src = './img/card/card-bg-z.png';
    images[4] = new Image();
    images[4].src = './img/card/border-house.png';
    images[5] = new Image();
    images[5].src = './img/card/border-weapon.png';
    images[6] = new Image();
    images[6].src = './img/card/card-back.png';
    images[7] = new Image();
    images[7].src = './img/card/border-neutral.png';
    images[8] = new Image();
    images[8].src = './img/card/card-tutorial.png';
    images[9] = new Image();
    images[9].src = './img/card/chip.png';
    images[10] = new Image();
    images[10].src = './img/card/chip-border-neutral.png';
    images[11] = new Image();
    images[11].src = './img/characters/hero.png';
    images[12] = new Image();
    images[12].src = './img/ui/day-teaser-left.png';
    images[13] = new Image();
    images[13].src = './img/ui/day-teaser-right.png';
  },

  preloadZombies: function () {
    let images = [];
    images[1] = new Image();
    images[1].src = './img/zombies/zombie-1.png';
    images[2] = new Image();
    images[2].src = './img/zombies/zombie-2.png';
    images[3] = new Image();
    images[3].src = './img/zombies/zombie-3.png';
    images[4] = new Image();
    images[4].src = './img/zombies/scratch.png';
    images[5] = new Image();
    images[5].src = './img/zombies/rat.png';
    images[6] = new Image();
    images[6].src = './img/zombies/bee.png';
    images[7] = new Image();
    images[7].src = './img/zombies/undead.png';
    images[8] = new Image();
    images[8].src = './img/zombies/dead.png';
  },
};
