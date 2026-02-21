import Props from './props.js';
import Player from './player.js';
import Companion from './companion.js';
import Items from './items.js';
import Crafting from './crafting.js';
import Ui from './ui.js';
import AlmanacManager from './core/almanac-manager.js';
import { CompanionManager } from './core/index.js';

export default {
  /**
   * Save the current game state to localStorage
   * @param {string} targetLocationName - Name of the current location
   */
  save: function (targetLocationName, localStorageKey = 'saveCheckpoint') {
    const checkpoint = {
      // ===== TIME =====
      // Game time tracking: ticks, hours, days, and time of day
      // Stored in game.timeIsUnity
      gameTime: Props.getGameProp('timeIsUnity'),

      // ===== PLAYER =====
      // Player character selection, position, and stats
      playerCharacter: Props.getGameProp('character'),
      playerPosition: Props.getGameProp('playerPosition'),
      playerStats: Props.getPlayerProps(),

      // ===== INVENTORY =====
      // All items and weapons with durability (includes doggy as weapon)
      // Save all items including amount=0 (indicates item has been discovered)
      inventoryItems: Object.fromEntries(Object.entries(Props.getInventory().items)),

      // ===== COMPANION =====
      // Companion state (doggy) - stored separately from inventory
      companion: CompanionManager.getCompanionFromInventory(),

      // ===== OBJECTS SYSTEM =====
      // All game entities: buildings, zombies, rats, bees, animals, weapons
      // Includes their state: looted, dead, health, items, positions, discovered, etc.
      objects: Props.getAllObjects(),
      objectIdsAt: Props.getAllObjectIdsAt(),
      objectsIdCounter:
        /* TESTING NEEDED! when it is saved it seems to be too far ahead > causes different card ids when recording vs. running tests */
        Props.getObjectsIdCounter(),
      zedCounter: Props.getZedCounter(),
      // Game seed
      gameSeed: Props.getGameProp('gameSeed'),

      // ===== TUTORIAL =====
      tutorial: Props.getGameProp('tutorial'),
      // Tutorial progression flags - track first occurrence of events
      firstUserInteraction: Props.getGameProp('firstUserInteraction'),
      firstFight: Props.getGameProp('firstFight'),
      firstInfestation: Props.getGameProp('firstInfestation'),
      firstLocked: Props.getGameProp('firstLocked'),
      firstSearch: Props.getGameProp('firstSearch'),
      firstZedNearby: Props.getGameProp('firstZedNearby'),
      firstRatFight: Props.getGameProp('firstRatFight'),
      firstAxeCraft: Props.getGameProp('firstAxeCraft'),
      firstCorpse: Props.getGameProp('firstCorpse'),
      firstLowEnergy: Props.getGameProp('firstLowEnergy'),
      firstDeadAnimal: Props.getGameProp('firstDeadAnimal'),
      firstInventoryOpen: Props.getGameProp('firstInventoryOpen'),
      firstCompanion: Props.getGameProp('firstCompanion'),

      // ===== ALMANAC =====
      // TODO: Discovered recipes and crafting options
      almanac: null,

      // ===== MAP =====
      // TODO: Explored areas and discovered locations
      map: null,

      // ===== MISC =====
      // Other game state information
      targetLocationName: targetLocationName,
    };

    // Save to localStorage
    localStorage.setItem(localStorageKey, JSON.stringify(checkpoint));

    // Show save confirmation UI
    document
      .getElementById('actions')
      .querySelector('li.mixed .game-saved')
      .classList.add('active');
    window.setTimeout(() => {
      document
        .getElementById('actions')
        .querySelector('li.mixed .game-saved')
        .classList.remove('active');
    }, 3000);
  },

  /**
   * Restore game state from a saved checkpoint
   * @param {object} checkpoint - The saved checkpoint data
   * @returns {boolean} - Success status
   */
  restore: function (checkpoint) {
    if (!checkpoint) {
      return false;
    }

    // ===== PLAYER CHARACTER =====
    // Restore selected character
    if (checkpoint.playerCharacter) {
      Props.setGameProp('character', checkpoint.playerCharacter);
    }

    // ===== INVENTORY =====
    Props.beginInventoryBatch();

    // Restore all inventory items and weapons (includes doggy)
    const inventoryItems = checkpoint.inventoryItems;
    for (let key in inventoryItems) {
      if (inventoryItems[key].durability !== undefined) {
        // Restore weapon with durability
        Props.addWeaponToInventory(inventoryItems[key].name, inventoryItems[key].amount, {
          durability: inventoryItems[key].durability,
        });
      } else {
        // Restore regular item
        Props.addItemToInventory(inventoryItems[key].name, inventoryItems[key].amount);
      }
    }
    Props.endInventoryBatch();

    Items.generateInventorySlots();
    Items.fillInventorySlots();
    Crafting.checkCraftingPrerequisits();

    // ===== COMPANION =====
    // Restore companion (doggy) state
    if (checkpoint.companion && checkpoint.companion.name) {
      Props.addCompanionToInventory(checkpoint.companion.name, checkpoint.companion);
      Companion.updateCompanionSlot();
      AlmanacManager.makeContentKnown(checkpoint.companion.name);
    }

    // ===== OBJECTS SYSTEM =====
    // Restore all game entities (buildings, zombies, rats, bees, animals, weapons)
    // This preserves state: looted buildings, dead zombies, spawned creatures, etc.
    if (checkpoint.objects && checkpoint.objectIdsAt) {
      // Reset discovered property on all objects so they aren't automatically visible
      const objects = checkpoint.objects.map(obj => {
        if (obj && typeof obj === 'object') {
          return { ...obj, discovered: false };
        }
        return obj;
      });

      if (Props.getGameProp('local') && Props.getGameProp('cheatMode')) {
        // Regenerate buildings for infinite loot cheat
        Props.setupAllBuildings();
        Props.setupAllZeds();
      } else {
        // Normal behavior: restore saved state
        Props.setAllObjects(objects);
        Props.setAllObjectIdsAt(checkpoint.objectIdsAt);
        Props.setObjectsIdCounter(checkpoint.objectsIdCounter);
        Props.setZedCounter(checkpoint.zedCounter);
      }
    } else {
      // Fallback for old save files: regenerate fresh (loses state)
      Props.setupAllBuildings();
      Props.setupAllZeds();
    }
    // Game seed
    if (checkpoint.gameSeed) {
      Props.setGameProp('gameSeed', checkpoint.gameSeed);
    }

    // ===== PLAYER POSITION =====
    // Restore player position on map
    Player.setPlayerPosition(checkpoint.playerPosition.x, checkpoint.playerPosition.y);

    // ===== PLAYER STATS =====
    // Restore health, food, thirst, energy
    Props.changePlayerProp('health', checkpoint.playerStats.health);
    Props.changePlayerProp('food', checkpoint.playerStats.food);
    Props.changePlayerProp('thirst', checkpoint.playerStats.thirst);
    Props.changePlayerProp('energy', checkpoint.playerStats.energy);

    // ===== TIME =====
    // Restore game time and day/night cycle
    Props.updateTimeIsUnity(checkpoint.gameTime);
    Props.setGameProp('startDay', checkpoint.gameTime.gameDays);

    // Update UI for current time of day
    this.adjustDayTimeUI();

    // ===== TUTORIAL =====
    if (checkpoint.tutorial !== undefined) Props.setGameProp('tutorial', checkpoint.tutorial);
    // Restore tutorial progression flags
    if (checkpoint.firstUserInteraction !== undefined)
      Props.setGameProp('firstUserInteraction', checkpoint.firstUserInteraction);
    if (checkpoint.firstFight !== undefined) Props.setGameProp('firstFight', checkpoint.firstFight);
    if (checkpoint.firstInfestation !== undefined)
      Props.setGameProp('firstInfestation', checkpoint.firstInfestation);
    if (checkpoint.firstLocked !== undefined)
      Props.setGameProp('firstLocked', checkpoint.firstLocked);
    if (checkpoint.firstSearch !== undefined)
      Props.setGameProp('firstSearch', checkpoint.firstSearch);
    if (checkpoint.firstZedNearby !== undefined)
      Props.setGameProp('firstZedNearby', checkpoint.firstZedNearby);
    if (checkpoint.firstRatFight !== undefined)
      Props.setGameProp('firstRatFight', checkpoint.firstRatFight);
    if (checkpoint.firstAxeCraft !== undefined)
      Props.setGameProp('firstAxeCraft', checkpoint.firstAxeCraft);
    if (checkpoint.firstCorpse !== undefined)
      Props.setGameProp('firstCorpse', checkpoint.firstCorpse);
    if (checkpoint.firstLowEnergy !== undefined)
      Props.setGameProp('firstLowEnergy', checkpoint.firstLowEnergy);
    if (checkpoint.firstDeadAnimal !== undefined)
      Props.setGameProp('firstDeadAnimal', checkpoint.firstDeadAnimal);
    if (checkpoint.firstInventoryOpen !== undefined)
      Props.setGameProp('firstInventoryOpen', checkpoint.firstInventoryOpen);
    if (checkpoint.firstCompanion !== undefined)
      Props.setGameProp('firstCompanion', checkpoint.firstCompanion);

    // ===== ALMANAC =====
    // TODO: Restore discovered recipes/crafting options

    // ===== MAP =====
    // TODO: Restore explored areas and discovered locations

    return true;
  },

  /**
   * Adjust UI elements based on the current time of day
   */
  adjustDayTimeUI: function () {
    const time = Props.getGameProp('timeIsUnity');
    Ui.updateDayNightLayers(time.todayHours);
    if (time.todayHours >= 21 || time.todayHours < 5) {
      Ui.switchDayNight(21);
    } else {
      Ui.switchDayNight(5);
    }
    if (time.todayHours >= 23 || time.todayHours < 5) {
      Ui.triggerNight();
    }
  },
};
