// @ts-check
/**
 * @import { WeaponDefinition } from '../../data/definitions/weapons-definitions.js'
 * @import { TutorialEvent, SpecialEvent } from '../../data/definitions/tutorial-definitions.js'
 */

import { LootUtils, TutorialDefinitions } from '../../data/index.js';
import ObjectFactory from './object-factory.js';
import Props from '../props.js';

/**
 * Tutorial-specific initializer for setting up the map and objects
 */

export default {
  /**
   * @returns {Record<string, TutorialEvent>}
   */
  getTutorialEvents: function () {
    return TutorialDefinitions.events;
  },

  /**
   * @returns {Record<string, SpecialEvent>}
   */
  getSpecialEvents: function () {
    return TutorialDefinitions.specialEvents;
  },

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

  setupAllEvents: function () {
    const events = this.getTutorialEvents();
    for (var event in events) {
      if (Props.getGameProp('tutorial') || events[event].showAlways) {
        const x = parseInt(event.split('-')[0]);
        const y = parseInt(event.split('-')[1]);
        Props.setEventAt(
          x,
          y,
          events[event].title,
          events[event].text,
          events[event].highlightObjects
        );
      }
    }
  },

  /**
   *
   * @param {string} eventId
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  setupSpecialEvent: function (eventId, x, y) {
    const specialEvents = this.getSpecialEvents();
    const currentObjectsIdCounter = Props.setEventAt(
      x,
      y,
      specialEvents[eventId].title,
      specialEvents[eventId].text,
      specialEvents[eventId].highlightObjects
    );
    return currentObjectsIdCounter;
  },
};
