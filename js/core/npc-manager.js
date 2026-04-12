// @ts-check

import NpcDefinitions from '../../data/definitions/npc-definitions.js';

export default {
  /**
   * @param {string} npcName
   * @param {string} map
   * @returns {Array<string>}
   */
  getNpcDialogEventIds: function (npcName, map) {
    const npcDefinition = NpcDefinitions[npcName];
    if (!npcDefinition) {
      console.warn(`No NPC definition found for ${npcName}`);
      return [];
    }

    const dialogs = npcDefinition.dialogs[map];

    return dialogs || [];
  },

  /**
   * @param {string} npcName
   * @param {string} map
   * @returns {string|null}
   */
  getNextNpcDialogEventId: function (npcName, map) {
    const npcDefinition = NpcDefinitions[npcName];
    if (!npcDefinition) {
      console.warn(`No NPC definition found for ${npcName}`);
      return null;
    }

    const dialogs = npcDefinition.dialogs[map];

    return dialogs.shift() || null;
  },
};
