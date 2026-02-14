// @ts-check
/**
 * @import { WeaponDefinition } from '../../data/definitions/weapons-definitions.js'
 */

import { LootUtils } from '../../data/index.js';
import ObjectFactory from './object-factory.js';
import Props from '../props.js';

/**
 * Tutorial-specific initializer for setting up the map and objects
 */

export default {
  /** Tutorial-specific map setup
   * For now it only sets up the building with the weapon and the zed, but it can be expanded in the future if needed
   * @returns {void}
   */
  setupTutorialMap: function () {
    ObjectFactory.setupBuilding(
      18,
      44,
      ['crate'],
      false,
      LootUtils.forceLootItemList(['drink-5', 'fruit-bread', 'wooden-club'])
    );
    /** @type {WeaponDefinition} */
    const axeProps = Props.getWeaponDefinition('axe');
    ObjectFactory.setupWeapon(18, 44, 'axe', {
      attack: axeProps.attack / 2,
      defense: axeProps.defense / 2,
      durability: axeProps.durability / 2,
    });
    ObjectFactory.setZedAt(18, 42, 1, 3, 2); // weak zed for tutorial
  },
};
