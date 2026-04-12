// @ts-check
/**
 * @typedef {Object} NpcDefinition
 * @property {Record<string, Array<string>>} dialogs - Dialogs for different events (e.g., 'start', 'meeting-again')
 * @export
 */

/** @type {Record<string, NpcDefinition>} */
export default {
  'the-captain': {
    dialogs: {
      start: ['meeting-again', 'another-town'],
    },
  },
};
