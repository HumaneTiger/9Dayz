import Props from './props.js';
import Events, { EVENTS } from './core/event-manager.js';

const characterContainer = document.getElementById('character');
const slot1 = characterContainer.querySelector('.slot-1');
const slot2 = characterContainer.querySelector('.slot-2');

/**
 * Character module to handle character container interactions and character-related UI updates
 */

export default {
  init: function () {
    characterContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
    Events.on(
      EVENTS.GAME_PROP_CHANGED,
      ({ prop, value }) => {
        if (prop === 'character') {
          this.updateCharacterName(value);
        }
      },
      { prop: 'character', value: Props.getGameProp('character') }
    );
  },

  checkForSlotClick: function () {
    // needed for test player backward compatibility, but currently no character slot interactions
  },

  updateCharacterName: function (characterName) {
    document.getElementById('character').querySelector('.slot-hero h2').textContent = characterName;
  },

  numberFilledSlots: function () {
    return (
      (slot1.classList.contains('active') ? 1 : 0) + (slot2.classList.contains('active') ? 1 : 0)
    );
  },
};
