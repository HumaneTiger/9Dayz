/**
 * Simple Event Bus for decoupling state changes from UI updates
 *
 * Convention: Event handlers should NEVER emit new events (no chaining)
 * Use events for simple notifications only, not orchestration
 */

class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
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

// Central event registry - all events documented here
export const EVENTS = {
  PLAYER_PROP_CHANGED: 'player:propChanged',
};

export default new EventBus();
