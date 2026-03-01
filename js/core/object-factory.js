// @ts-check
/**
 * @import { GameObject, CreatureObject, AdditionalGameObject, CreatureType, LootItem, ObjectIdList, ObjectType } from './object-state.js'
 * @import { BuildingProp } from '../../data/definitions/building-definitions.js'
 * @import { WeaponStats } from './game-state.js'
 * @import { CompanionDefinition } from '../../data/definitions/companion-definitions.js'
 */

import { LootUtils, BuildingUtils, BuildingDefinitions } from '../../data/index.js';
import RngUtils from '../utils/rng-utils.js';
import {
  GameState,
  ObjectState,
  ActionsManager,
  CompanionManager,
  WeaponsManager,
} from './index.js';

// Destructure building definitions for use throughout the file
/** @type {Record<string, BuildingProp>} */
const buildingProps = BuildingDefinitions.buildingProps;

export default {
  /**
   * @param {CreatureType} creatureType
   * @param {number} x
   * @param {number} y
   * @returns {CreatureObject[]}
   */
  createCreaturesList: function (creatureType, x, y) {
    /** @type {CreatureObject[]} */
    let creaturesList = [];
    switch (creatureType) {
      case 'rat':
        {
          const amount = Math.round(Math.random() * 5) || 3;
          for (let i = 0; i < amount; i++) {
            const lootItemList = LootUtils.createLootItemList(2, ['meat', 'bones'], [11, 6], 2);
            creaturesList.push({
              x: x,
              y: y,
              name: 'rat',
              type: 'rat',
              items: lootItemList,
              attack: Math.floor(Math.random() * 3 + 1),
              defense: Math.floor(Math.random() * 4 + 2),
              dead: false,
            });
          }
        }
        break;
      case 'bee':
        {
          const amount = Math.round(Math.random() * 2) + 4;
          for (let i = 0; i < amount; i++) {
            const lootItemList = LootUtils.createLootItemList(1, ['meat'], [7, 5], 1);
            creaturesList.push({
              x: x,
              y: y,
              name: 'bee',
              type: 'bee',
              items: lootItemList,
              attack: Math.floor(Math.random() * 3 + 1),
              defense: Math.floor(Math.random() * 4 + 2),
              dead: false,
            });
          }
        }
        break;
    }
    return creaturesList;
  },

  /**
   * @param {string} buildingType
   * @param {string} buildingName
   * @param {number} x
   * @param {number} y
   * @returns {Array<AdditionalGameObject>}
   */
  createAdditionalGameObjects: function (buildingType, buildingName, x, y) {
    /** @type {Array<AdditionalGameObject>} */
    let additionalGameObjects = [];
    if (buildingType === 'house' && Math.random() < 0.25) {
      additionalGameObjects.push({
        x: x,
        y: y,
        name: 'human-corpse-1',
        group: 'building',
        forceInfested: false,
        forceLootItemList: this.createBuildingLootItemList('human-corpse-1'),
      });
    }

    if ((buildingName === 'house' || buildingName === 'farm-house') && Math.random() < 0.2) {
      additionalGameObjects.push({
        x: x,
        y: y,
        name: 'basement',
        group: 'building',
        forceInfested: true,
        forceLootItemList: this.createBuildingLootItemList('basement'),
        forceCreaturesList: this.createCreaturesList('rat', x, y),
      });
    }

    /* old villas have a guaranteed basement with crate */
    if (buildingName === 'old-villa') {
      additionalGameObjects.push({
        x: x,
        y: y,
        name: 'basement',
        group: 'building',
        forceInfested: true,
        forceCreaturesList: this.createCreaturesList('rat', x, y),
        forceAdditionalGameObjects: [
          {
            x: x,
            y: y,
            name: 'crate',
            group: 'building',
            forceInfested: false,
            forceLootItemList: this.createBuildingLootItemList('crate'),
          },
        ],
      });
    }

    if (buildingName === 'well' || buildingName === 'jetty') {
      if (Math.random() < 0.15) {
        additionalGameObjects.push({
          x: x,
          y: y,
          name: 'froggy',
          group: 'animal',
          items: LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 6], 3),
          dead: true,
        });
      } else if (Math.random() < 0.2) {
        // 0.15 probability for second branch
        additionalGameObjects.push({
          x: x,
          y: y,
          name: 'duck',
          group: 'animal',
          items: LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 6], 3),
          dead: true,
        });
      }
    }

    if (buildingName === 'barn' || buildingName === 'field') {
      if (Math.random() < 0.1) {
        additionalGameObjects.push({
          x: x,
          y: y,
          name: 'duck',
          group: 'animal',
          items: LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 6], 3),
          dead: true,
        });
      }
    }

    return additionalGameObjects;
  },

  /**
   * @param {string} buildingName
   * @param {boolean|LootItem[]} [forceLootItemList=false]
   * @returns {LootItem[]}
   */
  createBuildingLootItemList: function (buildingName, forceLootItemList = false) {
    const props = buildingProps[buildingName];
    return Array.isArray(forceLootItemList)
      ? forceLootItemList
      : LootUtils.createLootItemList(
          props.spawn,
          JSON.parse(JSON.stringify(props.items)),
          BuildingUtils.getLootBuildingProbability(
            buildingName,
            GameState.getGameProp('character')
          ),
          props.amount,
          () => RngUtils.lootRNG.random()
        );
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {string[]} buildingNamesArray
   * @param {boolean} [forceInfested=false]
   * @param {boolean|LootItem[]} [forceLootItemList=false]
   * @param {boolean|CreatureObject[]} [forceCreaturesList=false]
   * @param {boolean|Array<AdditionalGameObject>} [forceAdditionalGameObjects=false]
   * @returns {void}
   */
  setupBuilding: function (
    x,
    y,
    buildingNamesArray,
    forceInfested = false,
    forceLootItemList = false,
    forceCreaturesList = false,
    forceAdditionalGameObjects = false
  ) {
    buildingNamesArray.forEach(buildingName => {
      const props = buildingProps[buildingName];
      const type = BuildingUtils.getBuildingTypeOf(buildingName);
      if (!props || !type) {
        console.warn(`No building props or type found for ${buildingName}`);
        return;
      }
      // Type is now guaranteed to be ObjectType after the guard
      const buildingType = /** @type {ObjectType} */ (type);
      // Generate loot upfront
      const lootItemList = this.createBuildingLootItemList(buildingName, forceLootItemList);

      /* buildings define a "locked" property which can be a number (probability out of 10), or 11 for always locked */
      const locked = props.locked === 11 ? true : Math.random() * props.locked > 1 ? true : false;

      // Pre-generate random key if the building is locked
      let hasKey = false;
      if (locked) {
        if (Math.random() >= 0.5) hasKey = true; // 50% chance to have key
      }

      // Random infested state
      const infested = buildingType === 'house' && Math.random() < 0.5 ? true : false;

      // Pre-generate creatures if the building is infested
      /** @type {CreatureObject[]} */
      let creaturesList = [];
      if (forceInfested || infested) {
        if (buildingName === 'beehive') {
          creaturesList = Array.isArray(forceCreaturesList)
            ? forceCreaturesList
            : this.createCreaturesList('bee', x, y);
        } else {
          creaturesList = Array.isArray(forceCreaturesList)
            ? forceCreaturesList
            : this.createCreaturesList('rat', x, y);
        }
      }

      // for certain buildings, add additional buildings which spawn when the building is searched
      /** @type {Array<AdditionalGameObject>} */
      let additionalGameObjects = [];
      additionalGameObjects = Array.isArray(forceAdditionalGameObjects)
        ? forceAdditionalGameObjects
        : this.createAdditionalGameObjects(buildingType, buildingName, x, y);

      // Assign a stable object ID
      const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);

      // Create building object with everything persisted
      ObjectState.setObject(
        currentObjectsIdCounter,
        ObjectState.createGameObject({
          x: x,
          y: y,
          name: buildingName,
          title: buildingName.startsWith('signpost-')
            ? 'signpost'
            : buildingName.replace('-1', '').replace('-2', '').replace('-', ' '),
          type: buildingType,
          group: 'building',
          actions: ActionsManager.getActionsForBuildingType(
            buildingName,
            buildingType,
            locked,
            forceInfested || infested,
            GameState.getGameProp('character')
          ),
          items: lootItemList,
          locked: locked,
          hasKey: hasKey,
          infested: forceInfested || infested,
          enemies: creaturesList,
          preview: props.preview,
          additionalGameObjects: additionalGameObjects,
        })
      );
    });
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} amount
   * @param {number|boolean} [forceAttack=false]
   * @param {number|boolean} [forceDefense=false]
   * @returns {void}
   */
  setZedAt: function (x, y, amount, forceAttack = false, forceDefense = false) {
    for (let i = 0; i < amount; i += 1) {
      const distance = Math.sqrt(
        Math.pow(GameState.getGameProp('playerPosition').x - x, 2) +
          Math.pow(GameState.getGameProp('playerPosition').y - y, 2)
      );

      const attack =
        typeof forceAttack === 'number'
          ? forceAttack
          : Math.floor(Math.random() * 6 + Math.min(distance / 5, 9) + 1); // increase attack with distance
      const defense =
        typeof forceDefense === 'number'
          ? forceDefense
          : Math.floor(Math.random() * 9 + Math.min(distance / 4, 9)); // increase defense with distance
      const lootItemList = LootUtils.createLootItemList(
        3,
        [
          'fail',
          'hacksaw',
          'knife',
          'mallet',
          'pincers',
          'spanner',
          'tape',
          'snack-1',
          'drink-1',
          'nails',
        ],
        [10, attack >= 10 ? 9 : 5]
      );
      const currentZedCounter = ObjectState.getZedCounter();
      const name = 'zombie-' + currentZedCounter;

      ObjectState.setZedCounter((currentZedCounter % 3) + 1); // Cycle through 1, 2, 3

      const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
      ObjectState.setObject(
        currentObjectsIdCounter,
        ObjectState.createGameObject({
          x: x,
          y: y,
          name: name,
          group: 'zombie',
          actions: ActionsManager.getActionsForGameObjectType('zombie'),
          items: lootItemList,
          attack: attack,
          defense: defense,
          luringSuccessful: Math.random() >= 0.4, // 60:40 chance it works
          dead: false,
        })
      );
    }
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} title
   * @param {string} text
   * @returns {number}
   */
  setEventAt: function (x, y, title, text) {
    const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
    ObjectState.setObject(
      currentObjectsIdCounter,
      ObjectState.createGameObject({
        x: x,
        y: y,
        name: 'event',
        title: title,
        group: 'event',
        text: text,
        actions: ActionsManager.getActionsForGameObjectType('event'),
        items: [],
        discovered: false,
      })
    );

    return currentObjectsIdCounter;
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {CreatureObject[]} creaturesList
   * @returns {ObjectIdList}
   */
  spawnCreaturesAt: function (x, y, creaturesList) {
    /** @type {ObjectIdList} */
    let spawnedCreatureIds = [];
    creaturesList.forEach(creature => {
      const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
      ObjectState.setObject(
        currentObjectsIdCounter,
        ObjectState.createGameObject({
          x: creature.x,
          y: creature.y,
          name: creature.name,
          type: creature.type,
          group: 'zombie',
          actions: ActionsManager.getActionsForGameObjectType('creature'),
          items: creature.items,
          attack: creature.attack,
          defense: creature.defense,
          luringSuccessful: Math.random() >= 0.4, // 60:40 chance it works
          dead: creature.dead,
        })
      );
      spawnedCreatureIds.push(currentObjectsIdCounter);
    });
    return spawnedCreatureIds;
  },

  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  rngFishSpawn: function (x, y) {
    /**
     * 3/4 chance to catch a fish
     * Deterministic RNG based on game seed
     * Allows for consistent fish spawns for test playbacks
     */
    if (RngUtils.fishingRNG.random() < 0.75) {
      this.spawnAnimal({
        x: x,
        y: y,
        name: 'fish',
        group: 'animal',
        items: LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 6], 3, () =>
          RngUtils.fishingRNG.random()
        ), // pass the same RNG for deterministic loot
        dead: true,
      });
      return true;
    }
    return false;
  },

  /**
   * @param {Partial<GameObject>} object
   * @returns {void}
   */
  spawnAnimal: function (object) {
    if (!object.x || !object.y) return;
    const currentObjectsIdCounter = ObjectState.addObjectIdAt(object.x, object.y);
    ObjectState.setObject(
      currentObjectsIdCounter,
      ObjectState.createGameObject({
        x: object.x,
        y: object.y,
        name: object.name,
        group: object.group,
        actions: ActionsManager.getActionsForGameObjectType('animal'),
        items: object.items,
        attack: 0,
        defense: 0,
        dead: object.dead,
      })
    );
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} companionName
   * @param {(Partial<CompanionDefinition> & { dead?: boolean })|undefined} [forceStats]
   * @returns {void}
   */
  spawnCompanionAt: function (x, y, companionName, forceStats) {
    const props = CompanionManager.getCompanionDefinition(companionName);
    const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
    const lootItemList = LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 8], 3);
    ObjectState.setObject(
      currentObjectsIdCounter,
      ObjectState.createGameObject({
        x: x,
        y: y,
        name: companionName,
        group: 'animal',
        actions: ActionsManager.getActionsForGameObjectType('companion'),
        items: lootItemList,
        attack: forceStats?.damage || props.damage,
        defense: forceStats?.protection || props.protection,
        maxHealth: forceStats?.maxHealth || props.maxHealth,
        health: forceStats?.health || props.health,
        dead: forceStats?.dead || false,
      })
    );
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} weaponName
   * @param {WeaponStats|undefined} [forceStats]
   * @returns {void}
   */
  setupWeapon: function (x, y, weaponName, forceStats) {
    const props = WeaponsManager.getWeaponDefinition(weaponName);
    const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
    ObjectState.setObject(
      currentObjectsIdCounter,
      ObjectState.createGameObject({
        x: x,
        y: y,
        name: weaponName,
        title: weaponName.replace('-', ' '),
        group: 'weapon',
        actions: ActionsManager.getActionsForGameObjectType('weapon'),
        attack: forceStats?.attack || props.attack,
        defense: forceStats?.defense || props.defense,
        durability: forceStats?.durability || props.durability,
      })
    );
  },

  /* === Building Props Data Accessor === */

  /**
   * @returns {Object}
   */
  getBuildingProps: function () {
    return buildingProps;
  },
};
