/**
 * Simple Event Bus for decoupling state changes from UI updates
 *
 * Convention: Event handlers should NEVER emit new events (no chaining)
 * Use events for simple notifications only, not orchestration
 */

// @ts-check

// Central event registry - all events documented here
export const EVENTS = {
  PLAYER_PROP_CHANGED: 'player:propChanged',
  GAME_PROP_CHANGED: 'game:propChanged',
  INVENTORY_CHANGED: 'inventory:changed',
  FIRST_ITEM_ADDED: 'inventory:firstItemAdded',
  WEAPON_CHANGED: 'weapon:changed',
  PLAYER_MOVE_TO: 'player:moveTo',
  PLAYER_UPDATE: 'player:update',
};

/**
 * @typedef {Object} PropChangeEvent
 * @property {string} prop
 * @property {any} value
 */

class EventBus {
  constructor() {
    /** @type {Record<string, Function[]>} */
    this.listeners = {};
  }

  /**
   * Register an event listener
   * @param {string} event - The event to listen to
   * @param {(data: PropChangeEvent) => void} callback - Function to call when event is emitted
   * @param {*} immediateData - Optional: If provided, callback is called immediately with this data
   *                            Useful for syncing initial state without duplicating handler logic
   */
  on(event, callback, immediateData) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // If immediateData provided, call callback immediately
    if (immediateData !== undefined) {
      callback(immediateData);
    }
  }

  /**
   * @param {string} event
   * @param {any} data
   * @returns {void}
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * @param {string} event
   * @param {Function} callback
   * @returns {void}
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
}

export default new EventBus();
