// @ts-check
/**
 * @import { AlmanacContentPage } from '../../data/definitions/almanac-definitions.js'
 */

import { AlmanacDefinitions } from '../../data/index.js';
import InventoryManager from './inventory-manager.js';

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
   * @return {string[]}
   */
  getKnownContent: function () {
    return AlmanacDefinitions.knownContent.slice();
  },

  /**
   * @param {string} content
   * @return {AlmanacContentPage|undefined}
   */
  getAlmanacContentPage: function (content) {
    return AlmanacDefinitions.contentPages[content];
  },

  getAllAlmanacPageNames: function () {
    // all content pages plus potential pages for all items
    const allContentPages = Object.keys(AlmanacDefinitions.contentPages);
    const allItems = Object.keys(InventoryManager.getAllItems());
    return allContentPages.concat(
      allItems.filter(item => !allContentPages.includes(item) && !/-\d+$/.test(item))
    );
  },
};
