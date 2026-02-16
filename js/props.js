import {
  CompanionManager,
  GameState,
  ObjectState,
  PlayerManager,
  InventoryManager,
  ObjectFactory,
  MapInitializer,
  TutorialManager,
} from './core/index.js';

import { LocationInstances } from '../../data/index.js';

export default {
  init: function () {
    GameState.init();
    MapInitializer.setupAllPaths();
  },

  /* === GameState delegations === */

  getGameProps: function () {
    return GameState.getGameProps();
  },

  getGameProp: function (prop) {
    return GameState.getGameProp(prop);
  },

  setGameProp: function (prop, value) {
    GameState.setGameProp(prop, value);
  },

  updateTimeIsUnity: function (updates) {
    GameState.updateTimeIsUnity(updates);
  },

  pauseGame: function (pause) {
    GameState.pauseGame(pause);
  },

  getPlayerProps: function () {
    return PlayerManager.getPlayerProps();
  },

  changePlayerProp: function (prop, change) {
    return PlayerManager.changePlayerProp(prop, change);
  },

  getCompanion: function () {
    return CompanionManager.getCompanion();
  },

  setCompanion: function (newCompanion) {
    CompanionManager.setCompanion(newCompanion);
  },

  getCrafting: function () {
    return GameState.getCrafting();
  },

  /* === InventoryManager delegations === */

  getInventory: function () {
    return InventoryManager.getInventory();
  },

  getInventoryItemNumbers: function () {
    return InventoryManager.getInventoryItemNumbers();
  },

  getInventoryPresets: function (character) {
    return InventoryManager.getInventoryPresets(character);
  },

  beginInventoryBatch: function () {
    InventoryManager.beginInventoryBatch();
  },

  endInventoryBatch: function () {
    InventoryManager.endInventoryBatch();
  },

  addWeaponToInventory: function (item, addAmount, setWeaponProps) {
    InventoryManager.addWeaponToInventory(item, addAmount, setWeaponProps);
  },

  getWeaponTotal: function () {
    return InventoryManager.getWeaponTotal();
  },

  addItemToInventory: function (item, addAmount) {
    InventoryManager.addItemToInventory(item, addAmount);
  },

  calcTotalInventoryItems: function () {
    InventoryManager.calcTotalInventoryItems();
  },

  calcItemProps: function (item) {
    return InventoryManager.calcItemProps(item, this.getGameProp('character'));
  },

  addCompanion: function (object) {
    CompanionManager.addCompanion(object);
  },

  /* === ObjectState delegations === */

  createGameObject: function (overrides = {}) {
    return ObjectState.createGameObject(overrides);
  },

  getObjectIdsAt: function (x, y) {
    return ObjectState.getObjectIdsAt(x, y);
  },

  getObjectsAt: function (x, y) {
    return ObjectState.getObjectsAt(x, y);
  },

  addObjectIdAt: function (x, y) {
    return ObjectState.addObjectIdAt(x, y);
  },

  getObject: function (id) {
    return ObjectState.getObject(id);
  },

  setObject: function (id, data) {
    ObjectState.setObject(id, data);
  },

  getAllObjects: function () {
    return ObjectState.getAllObjects();
  },

  setAllObjects: function (newObjects) {
    ObjectState.setAllObjects(newObjects);
  },

  getAllObjectIdsAt: function () {
    return ObjectState.getAllObjectIdsAt();
  },

  setAllObjectIdsAt: function (newObjectIdsAt) {
    ObjectState.setAllObjectIdsAt(newObjectIdsAt);
  },

  getObjectsIdCounter: function () {
    return ObjectState.getObjectsIdCounter();
  },

  setObjectsIdCounter: function (value) {
    ObjectState.setObjectsIdCounter(value);
  },

  getZedCounter: function () {
    return ObjectState.getZedCounter();
  },

  setZedCounter: function (value) {
    ObjectState.setZedCounter(value);
  },

  getAllPaths: function () {
    return MapInitializer.getAllPaths();
  },

  getAllTargetLocations: function () {
    return LocationInstances.targetLocations;
  },

  setupAllBuildings: function () {
    MapInitializer.setupAllBuildings();
  },

  setupAllZeds: function () {
    MapInitializer.setupAllZeds();
  },

  createCreaturesList: function (creatureType, x, y) {
    return ObjectFactory.createCreaturesList(creatureType, x, y);
  },

  createAdditionalGameObjects: function (buildingType, buildingName, x, y) {
    return ObjectFactory.createAdditionalGameObjects(buildingType, buildingName, x, y);
  },

  createBuildingLootItemList: function (buildingName, forceLootItemList = false) {
    return ObjectFactory.createBuildingLootItemList(buildingName, forceLootItemList);
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
    ObjectFactory.setupBuilding(
      x,
      y,
      buildingNamesArray,
      forceInfested,
      forceLootItemList,
      forceCreaturesList,
      forceAdditionalGameObjects
    );
  },

  setZedAt: function (x, y, amount, forceAttack = false, forceDefense = false) {
    ObjectFactory.setZedAt(x, y, amount, forceAttack, forceDefense);
  },

  setEventAt: function (x, y, title, text) {
    return ObjectFactory.setEventAt(x, y, title, text);
  },

  spawnCreaturesAt: function (x, y, creaturesList) {
    return ObjectFactory.spawnCreaturesAt(x, y, creaturesList);
  },

  rngFishSpawn: function (x, y) {
    return ObjectFactory.rngFishSpawn(x, y);
  },

  spawnAnimal: function (object) {
    ObjectFactory.spawnAnimal(object);
  },

  spawnDoggyAt: function (x, y, optCompanionProps) {
    return ObjectFactory.spawnDoggyAt(x, y, optCompanionProps);
  },

  setupWeapon: function (x, y, weaponName, forceStats) {
    ObjectFactory.setupWeapon(x, y, weaponName, forceStats);
  },

  setupAllPaths: function () {
    MapInitializer.setupAllPaths();
  },

  setupTutorialMap: function () {
    TutorialManager.setupTutorialMap();
  },

  getAllItems: function () {
    return InventoryManager.getAllItems();
  },

  getItemDefinition: function (item) {
    return InventoryManager.getItemDefinition(item);
  },

  getItemFromInventory: function (item) {
    return InventoryManager.getItemFromInventory(item);
  },

  getAllWeapons: function () {
    return InventoryManager.getAllWeapons();
  },

  getAllInventoryWeapons: function () {
    return InventoryManager.getAllInventoryWeapons();
  },

  getWeaponFromInventory: function (item) {
    return InventoryManager.getWeaponFromInventory(item);
  },

  getWeaponDefinition: function (item) {
    return InventoryManager.getWeaponDefinition(item);
  },

  isWeapon: function (name) {
    return InventoryManager.isWeapon(name);
  },

  getWeaponProps: function (itemName) {
    return InventoryManager.getWeaponProps(itemName);
  },

  getWeaponPropsUpgrades: function (itemName) {
    return InventoryManager.getWeaponPropsUpgrades(itemName);
  },

  getBuildingProps: function () {
    return ObjectFactory.getBuildingProps();
  },
};
