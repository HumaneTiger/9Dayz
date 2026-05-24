/**
 * target locations are used for the "Signpost" event, and are also shown on the map
 * @typedef {Object} TargetLocation
 * @property {number[]} coords - The coordinates of the target location
 * @property {boolean} [specialLoot] - Indicates if the location has special loot
 */

/** @type {Record<string, TargetLocation>} */
export default {
  start: {
    'Lakeside Camp Resort': {
      coords: [5, 37],
    },
    Rocksprings: {
      coords: [22, 34],
    },
    'Haling Cove': {
      coords: [16, 8],
    },
    Litchfield: {
      coords: [15, 23],
    },
    Greenleafton: {
      coords: [33, 35],
    },
    'Billibalds Farm': {
      coords: [40, 30],
    },
    'Camp Silverlake': {
      coords: [28, 22],
    },
    'Harbor Gas Station': {
      coords: [34, 16],
    },
    Autumnridge: {
      coords: [18, 7],
    },
    Willowshade: {
      coords: [35, 41],
      specialLoot: true,
    },
  },
};
