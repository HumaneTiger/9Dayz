// @ts-check
/**
 * @import { AlmanacContentPage } from '../../data/definitions/almanac-definitions.js'
 */

import { AlmanacDefinitions } from '../../data/index.js';

export default {
  /**
   * @param {string} content
   */
  makeContentKnown: function (content) {
    if (!AlmanacDefinitions.knownContent.includes(content)) {
      AlmanacDefinitions.knownContent.push(content);
    }
  },

  /**
   * @param {string} content
   */
  isContentKnown: function (content) {
    return AlmanacDefinitions.knownContent.includes(content);
  },

  /**
   * @param {string} content
   * @return {AlmanacContentPage|undefined}
   */
  getAlmanacContentPage: function (content) {
    return AlmanacDefinitions.contentPages[content];
  },
};
