import { LootUtils, WeaponsDefinitions } from '../../data/index.js';
import ObjectFactory from './object-factory.js';

const { weaponProps } = WeaponsDefinitions;

export default {
  // Tutorial-specific map setup
  setupTutorialMap: function () {
    ObjectFactory.setupBuilding(
      18,
      44,
      ['crate'],
      false,
      LootUtils.forceLootItemList(['drink-5', 'fruit-bread', 'wooden-club'])
    );
    ObjectFactory.setupWeapon(18, 44, 'axe', {
      attack: weaponProps['axe'].attack / 2,
      defense: weaponProps['axe'].defense / 2,
      durability: weaponProps['axe'].durability / 2,
    });
    ObjectFactory.setZedAt(18, 42, 1, 3, 2); // weak zed for tutorial
  },
};
