/**
 * Simple Event Bus for decoupling state changes from UI updates
 *
 * Convention: Event handlers should NEVER emit new events (no chaining)
 * Use events for simple notifications only, not orchestration
 */

// Central event registry - all events documented here
export const EVENTS = {
  PLAYER_PROP_CHANGED: 'player:propChanged',
  GAME_PROP_CHANGED: 'game:propChanged',
  INVENTORY_CHANGED: 'inventory:changed',
  WEAPON_CHANGED: 'weapon:changed',
};

class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Register an event listener
   * @param {string} event - The event to listen to
   * @param {function} callback - Function to call when event is emitted
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

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
}

export default new EventBus();
