/**
 * Utility functions for generating loot item lists
 */

export default {
  /**
   * Generate a forced loot list with guaranteed items
   * @param {string[]} forceItems - Array of item names to include
   * @param {number} maxAmount - Maximum amount per item
   * @returns {Array<{name: string, amount: number}>} Loot item list
   */
  forceLootItemList: function (forceItems, maxAmount) {
    let lootItemList = [];
    for (let i = 0; i < forceItems.length; i += 1) {
      lootItemList.push({
        name: JSON.parse(JSON.stringify(forceItems[i])),
        amount: Math.round(Math.random() * maxAmount) || 1,
      });
    }
    return lootItemList;
  },

  /**
   * Generate a random loot list based on probabilities
   * @param {number} spawn - Number of items to potentially spawn
   * @param {string[]} allItems - Array of possible item names (will be mutated)
   * @param {number[]} allProbabilities - [firstItemChance, nextItemsChance]
   * @param {number} amount - Maximum amount per item
   * @returns {Array<{name: string, amount: number}>} Loot item list
   */
  createLootItemList: function (spawn, allItems, allProbabilities, amount, rng) {
    // fallback to Math.random() if no seeded PRNG is provided
    const rand = rng || Math.random;

    const maxAmount = amount || 1;
    let lootItemList = [];
    let probability = allProbabilities[0];

    for (let i = 0; i < spawn; i += 1) {
      let randomItem = Math.floor(rand() * allItems.length);
      if (rand() * 10 < probability) {
        lootItemList.push({
          name: JSON.parse(JSON.stringify(allItems[randomItem])),
          amount: Math.round(rand() * maxAmount) || 1,
        });
        probability = allProbabilities[1];
      } else {
        lootItemList.push({
          name: JSON.parse(JSON.stringify(allItems[randomItem])),
          amount: 0,
        });
      }
      allItems.splice(randomItem, 1);
    }
    return lootItemList;
  },
};
