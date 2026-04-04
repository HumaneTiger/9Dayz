import Props from './props.js';
import { EventManager, EVENTS, CharacterManager } from './core/index.js';

const characterContainer = document.getElementById('character');

/**
 * Character module to handle character container interactions and character-related UI updates
 */

export default {
  init: function () {
    characterContainer.addEventListener('mousedown', this.checkForSlotClick.bind(this));
    this.addCharacterDescriptionMarkup();
    EventManager.on(
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
    return CharacterManager.getNumberFilledSlots();
  },

  addCharacterDescriptionMarkup: function () {
    const allCharacters = CharacterManager.getAllCharacterDefinitions();
    Object.keys(allCharacters).forEach(characterKey => {
      const characterDescriptionContainer = document.querySelector(
        `.screen__2a div[data-character="${characterKey}"]`
      );
      if (characterDescriptionContainer) {
        characterDescriptionContainer.innerHTML = allCharacters[characterKey].descriptionMarkup;
      }
    });
  },
};
