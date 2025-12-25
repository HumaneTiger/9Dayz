import Props from './props.js';
import Player from './player.js';
import Items from './items.js';
import Crafting from './crafting.js';
import Ui from './ui.js';

export default {
  /**
   * Save the current game state to localStorage
   * @param {string} targetLocationName - Name of the current location
   */
  save: function (targetLocationName) {
    const checkpoint = {
      // ===== TIME =====
      // Game time tracking: ticks, hours, days, and time of day
      // Exception: time is stored in window.timeIsUnity, not in Props
      gameTime: {
        gameTick: window.timeIsUnity.gameTick,
        gameHours: window.timeIsUnity.gameHours,
        gameDays: window.timeIsUnity.gameDays,
        todayHours: window.timeIsUnity.todayHours,
        todayTime: window.timeIsUnity.todayTime,
      },

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
      companion: Props.getCompanion(),

      // ===== OBJECTS SYSTEM =====
      // All game entities: buildings, zombies, rats, bees, animals, weapons
      // Includes their state: looted, dead, health, items, positions, discovered, etc.
      objects: Props.getAllObjects(),
      objectIdsAt: Props.getAllObjectIdsAt(),
      objectsIdCounter: Props.getObjectsIdCounter(),
      zedCounter: Props.getZedCounter(),

      // ===== TUTORIAL =====
      // TODO: Tutorial progress and completed events
      tutorial: null,

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
    localStorage.setItem('saveCheckpoint', JSON.stringify(checkpoint));

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
    // Add zero items first to present crafting options in Almanac
    // TODO: This should be handled by the almanac restoration system
    Props.beginInventoryBatch();
    Props.addItemToInventory('tape', 0);
    Props.addItemToInventory('sharp-stick', 0);
    Props.addItemToInventory('rope', 0);
    Props.addItemToInventory('bone-hook', 0);
    Props.addWeaponToInventory('wooden-club', 0, { durability: 0 });
    Props.addWeaponToInventory('improvised-axe', 0, { durability: 0 });
    Props.addWeaponToInventory('improvised-whip', 0, { durability: 0 });
    Props.addWeaponToInventory('fishing-rod', 0, { durability: 0 });

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

    // Process inventory for UI
    Props.modifyObjectProperties();
    Items.generateInventorySlots();
    Items.fillInventorySlots();
    Crafting.checkCraftingPrerequisits();

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
    window.timeIsUnity.gameTick = checkpoint.gameTime.gameTick;
    window.timeIsUnity.gameHours = checkpoint.gameTime.gameHours;
    window.timeIsUnity.gameDays = checkpoint.gameTime.gameDays;
    window.timeIsUnity.todayHours = checkpoint.gameTime.todayHours;
    window.timeIsUnity.todayTime = checkpoint.gameTime.todayTime;
    Props.setGameProp('startDay', checkpoint.gameTime.gameDays);

    // Update UI for current time of day
    this.adjustDayTimeUI();

    // ===== TUTORIAL =====
    // TODO: Restore tutorial progress

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
    Ui.updateDayNightLayers(window.timeIsUnity.todayHours);
    if (window.timeIsUnity.todayHours >= 21 || window.timeIsUnity.todayHours < 5) {
      Ui.switchDayNight(21);
    } else {
      Ui.switchDayNight(5);
    }
    if (window.timeIsUnity.todayHours >= 23 || window.timeIsUnity.todayHours < 5) {
      Ui.triggerNight();
    }
  },
};
