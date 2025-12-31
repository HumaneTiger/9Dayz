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
};
