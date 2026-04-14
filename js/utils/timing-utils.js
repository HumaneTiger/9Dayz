export default {
  /**
   * Waits for the specified number of milliseconds.
   * Usage: await TimingUtils.wait(1500);
   * @param {number} ms - time to wait in milliseconds
   * @returns {Promise<void>}
   */
  wait: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Waits for a CSS transition to finish on the given element,
   * with a fallback timeout to avoid hanging.
   * Usage: await TimingUtils.waitForTransition(elem, 2000);
   * @param {HTMLElement} elem
   * @param {number} fallbackMs - optional max wait time (ms)
   * @returns {Promise<void>}
   */
  waitForTransition: function (elem, fallbackMs = 3000) {
    return new Promise(resolve => {
      let finished = false;

      const onEnd = () => {
        if (!finished) {
          finished = true;
          elem.removeEventListener('transitionend', onEnd);
          clearTimeout(fallbackId);
          resolve();
        }
      };

      elem.addEventListener('transitionend', onEnd);

      const fallbackId = setTimeout(() => {
        if (!finished) {
          finished = true;
          elem.removeEventListener('transitionend', onEnd);
          resolve();
        }
      }, fallbackMs);
    });
  },

  /**
   * Converts a total number of hours into a human-readable "X days Y hours" string.
   * @param {number} totalHours
   * @returns {string}
   */
  formatDaysAndHours: function (totalHours) {
    const days = Math.floor(totalHours / 24);
    const hours = Math.ceil(totalHours % 24);
    if (days > 0 && hours > 0) return `${days} days ${hours} hours`;
    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  },
};
