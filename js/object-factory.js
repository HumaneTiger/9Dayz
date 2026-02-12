import LootUtils from '../data/utils/loot-utils.js';
import BuildingUtils from '../data/utils/building-utils.js';
import RngUtils from './utils/rng-utils.js';
import { BuildingDefinitions, ItemsWeaponsDefinitions } from '../data/index.js';
import GameState from './game-state.js';
import ObjectState from './object-state.js';

// Destructure building definitions for use throughout the file
const { buildingProps } = BuildingDefinitions;

// Destructure items/weapons definitions
const { weaponProps } = ItemsWeaponsDefinitions;

export default {
  createCreaturesList: function (creatureType, x, y) {
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

  createAdditionalGameObjects: function (buildingType, buildingName, x, y) {
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

  createBuildingLootItemList: function (buildingName, forceLootItemList = false) {
    const props = buildingProps[buildingName];
    return (
      forceLootItemList ||
      LootUtils.createLootItemList(
        props.spawn,
        JSON.parse(JSON.stringify(props.items)),
        BuildingUtils.getLootBuildingProbability(buildingName, GameState.getGameProp('character')),
        props.amount,
        () => RngUtils.lootRNG.random()
      )
    );
  },

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
      // Generate loot upfront
      const lootItemList = this.createBuildingLootItemList(buildingName, forceLootItemList);

      // Random locked state
      const locked = props.locked === 11 ? true : Math.random() * props.locked > 1 ? true : false;

      // Pre-generate random key if the building is locked
      let hasKey = false;
      if (locked) {
        if (Math.random() >= 0.5) hasKey = true; // 50% chance to have key
      }

      // Random infested state
      const infested = type === 'house' && Math.random() < 0.5 ? true : false;

      // Pre-generate creatures if the building is infested
      let creaturesList = [];
      if (forceInfested || infested) {
        if (buildingName === 'beehive') {
          creaturesList = forceCreaturesList || this.createCreaturesList('bee', x, y);
        } else {
          creaturesList = forceCreaturesList || this.createCreaturesList('rat', x, y);
        }
      }

      // for certain buildings, add additional buildings which spawn when the building is searched
      let additionalGameObjects = [];
      additionalGameObjects =
        forceAdditionalGameObjects || this.createAdditionalGameObjects(type, buildingName, x, y);

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
          type: type,
          group: 'building',
          actions: props.preview
            ? [{ id: 'got-it', label: 'Got it!' }]
            : BuildingUtils.getBuildingActionsFor(
                buildingName,
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

  setZedAt: function (x, y, amount, forceAttack = false, forceDefense = false) {
    for (let i = 0; i < amount; i += 1) {
      const distance = Math.sqrt(
        Math.pow(GameState.getGameProp('playerPosition').x - x, 2) +
          Math.pow(GameState.getGameProp('playerPosition').y - y, 2)
      );

      const attack = forceAttack || Math.floor(Math.random() * 6 + Math.min(distance / 5, 9) + 1); // increase attack with distance
      const defense = forceDefense || Math.floor(Math.random() * 9 + Math.min(distance / 4, 9)); // increase defense with distance
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
          actions: [
            { id: 'lure', label: 'Lure', time: 20, energy: -15 },
            { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
            { id: 'search', label: 'Search', time: 20, energy: -5 },
            { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
          ],
          items: lootItemList,
          attack: attack,
          defense: defense,
          luringSuccessful: Math.random() >= 0.4, // 60:40 chance it works
          dead: false,
        })
      );
    }
  },

  setEventAt: function (x, y, title, text) {
    const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
    ObjectState.setObject(currentObjectsIdCounter, {
      x: x,
      y: y,
      name: 'event',
      title: title,
      type: undefined,
      group: 'event',
      text: text,
      actions: [
        {
          id: 'got-it',
          label: 'Got it!',
        },
      ],
      items: [],
      discovered: false,
      removed: false,
    });

    return currentObjectsIdCounter;
  },

  spawnCreaturesAt: function (x, y, creaturesList) {
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
          actions: [
            { id: 'lure', label: 'Lure', time: 20, energy: -15 },
            { id: 'attack', label: 'Attack!', time: 5, energy: -20, critical: true },
            { id: 'chomp', label: '"Chomp!"', time: 20, energy: 0 },
            { id: 'cut', label: 'Cut', time: 20, energy: -15 },
          ],
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

  spawnAnimal: function (object) {
    const currentObjectsIdCounter = ObjectState.addObjectIdAt(object.x, object.y);
    ObjectState.setObject(
      currentObjectsIdCounter,
      ObjectState.createGameObject({
        x: object.x,
        y: object.y,
        name: object.name,
        group: object.group,
        actions: [
          //{ id: 'catch', label: 'Catch', time: 20, energy: -20 },
          { id: 'cut', label: 'Cut', time: 20, energy: -15 },
        ],
        items: object.items,
        attack: false,
        defense: false,
        dead: object.dead,
      })
    );
  },

  spawnDoggyAt: function (x, y, optCompanionProps) {
    const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
    const lootItemList = LootUtils.createLootItemList(2, ['meat', 'bones'], [10, 8], 3);
    ObjectState.setObject(
      currentObjectsIdCounter,
      ObjectState.createGameObject({
        x: x,
        y: y,
        name: optCompanionProps?.name ?? 'doggy',
        group: 'animal',
        actions: [
          { id: 'pet', label: 'Pet', time: 5, energy: -5 },
          { id: 'scare', label: 'Scare Away', time: 5, energy: -5 },
          { id: 'cut', label: 'Cut', time: 20, energy: -15 },
        ],
        items: lootItemList,
        attack: optCompanionProps?.damage ?? 4,
        defense: optCompanionProps?.defense ?? 0,
        maxHealth: optCompanionProps?.maxHealth ?? 10,
        health: optCompanionProps?.health ?? 6,
        dead: optCompanionProps?.dead ?? false,
      })
    );

    return currentObjectsIdCounter;
  },

  setupWeapon: function (x, y, weaponName, forceStats) {
    const props = weaponProps[weaponName];
    const currentObjectsIdCounter = ObjectState.addObjectIdAt(x, y);
    ObjectState.setObject(
      currentObjectsIdCounter,
      ObjectState.createGameObject({
        x: x,
        y: y,
        name: weaponName,
        title: weaponName.replace('-', ' '),
        group: 'weapon',
        actions: props.preview
          ? [{ id: 'got-it', label: 'Got it!' }]
          : [{ id: 'equip', label: 'Equip' }],
        attack: forceStats?.attack || props.attack,
        defense: forceStats?.defense || props.defense,
        durability: forceStats?.durability || props.durability,
        preview: props.preview,
      })
    );
  },

  /* === Building Props Data Accessor === */

  getBuildingProps: function () {
    return buildingProps;
  },
};
