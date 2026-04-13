// @ts-check

import shipDefinitions from '../../data/definitions/ship-definitions.js';
import { EventManager, EVENTS } from './index.js';

export default {
  getShipProps: function () {
    return shipDefinitions;
  },

  /**
   *
   * @param {*} foodItem
   * @returns {number}
   */
  calcFoodToWaitingTimeRatio: function (foodItem) {
    const combinedFoodValue = foodItem.food + foodItem.drink + foodItem.energy;
    if (!combinedFoodValue) {
      return 0;
    }
    const foodToWaitingTimeRatio = combinedFoodValue / 5;
    return foodToWaitingTimeRatio;
  },

  /**
   *
   * @param {*} item
   * @returns {number}
   */
  calcItemToShipFuelRatio: function (item) {
    let fuelValue = 0;
    if (item.name === 'fuel') {
      fuelValue = 20;
    } else if (item.name === 'spanner') {
      fuelValue = 5;
    }
    return fuelValue;
  },

  /**
   *
   * @param {number} fuelAmount
   */
  addFuel: function (fuelAmount) {
    shipDefinitions.fuel += fuelAmount;
    if (shipDefinitions.fuel > 100) {
      shipDefinitions.fuel = 100;
    }
    // EVENT: Notify UI that ship property changed
    EventManager.emit(EVENTS.SHIP_PROP_CHANGED, {
      prop: 'fuel',
      newValue: shipDefinitions.fuel,
    });
  },

  /**
   *
   * @param {number} waitingTime
   */
  addWaitingTime: function (waitingTime) {
    shipDefinitions.time += waitingTime;
    if (shipDefinitions.time > 250) {
      shipDefinitions.time = 250;
    }
    // EVENT: Notify UI that ship property changed
    EventManager.emit(EVENTS.SHIP_PROP_CHANGED, {
      prop: 'time',
      newValue: shipDefinitions.time,
    });
  },
};
