# 9Dayz Architecture: Convention Analysis

## Quick Reference Matrix

| #   | Domain                                  | Definition | Core Manager | Game Logic | Key Insights                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | --------------------------------------- | :--------: | :----------: | :--------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **INVENTORY & ITEMS**                   |     ✅     |      ✅      |     ✅     | Inventory query functions (inventoryContains, inventoryKnows, inventoryItemAmount, getFirstItemOfType, getItemByName) moved to inventory-manager.js; items.js now delegates to InventoryManager                                                                                                                                                                                                                                         |
| 2   | **WORLD** (Map/Buildings/Paths/Zombies) |     ✅     |      ✅      |     ✅     | Pattern to follow                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 3   | **RECIPES** (Cooking & Crafting)        |     ✅     |      ✅      |     ✅     | recipes-manager.js created with unified API; cooking.js and crafting.js now use RecipesManager                                                                                                                                                                                                                                                                                                                                          |
| 4   | **ALMANAC**                             |     ✅     |      ✅      |     ✅     | almanac-manager.js created with unified API (makeContentKnown, isContentKnown, getAlmanacContentPage); almanac-definitions.js contains all content pages and known content state; almanac.js delegates to AlmanacManager                                                                                                                                                                                                                |
| 5   | **CHARACTER**                           |     ✅     |      ✅      |     ✅     | character-definitions.js and character-manager.js provide getInventoryPresets() and getItemModifier() getters; character.js delegates character logic to manager                                                                                                                                                                                                                                                                        |
| 6   | **COMPANION**                           |     ✅     |      ✅      |     ✅     | Companion system now has companion-definitions.js and companion-manager.js; UI logic split in character.js and companion.js                                                                                                                                                                                                                                                                                                             |
| 7   | **WEAPONS**                             |     ✅     |      ✅      |     ✅     | Weapons live in inventory and managed through InventoryManager; weapons-definitions.js defines all weapon metadata; read-only access via WeaponsDefinitions                                                                                                                                                                                                                                                                             |
| 8   | **PLAYER STATS**                        |     ✅     |      ✅      |     ✅     | Fully refactored with player-definitions.js and player-manager.js; PlayerManager handles all player prop changes                                                                                                                                                                                                                                                                                                                        |
| 9   | **BATTLE/COMBAT**                       |     ✅     |      ✅      |     ✅     | battle-definitions.js defines CombatCard and combat constants; battle-manager.js provides unified combat API; battle.js coordinates battle flow                                                                                                                                                                                                                                                                                         |
| 10  | **TUTORIAL**                            |     ✅     |      ✅      |     ✅     | tutorial-definitions.js exports events and specialEvents; tutorial-manager.js provides getTutorialEvents() and getSpecialEvents() getters plus setupTutorialMap() for tutorial-specific initialization                                                                                                                                                                                                                                  |
| 11  | **CARDS SYSTEM**                        |     ✅     |      ✅      |     ✅     | cards-definitions.js defines Card, CardDeck, BattleCard, BattleDeck, OpponentDeck types; cards-manager.js provides deck management and zombie status tracking; cards.js handles card UI                                                                                                                                                                                                                                                 |
| 12  | **EVENT BUS**                           |     ✅     |      -       |     -      | event-manager.js provides central event registry (PLAYER_PROP_CHANGED, GAME_PROP_CHANGED, INVENTORY_CHANGED, etc.) for decoupling state changes from UI updates; no events should chain                                                                                                                                                                                                                                                 |
| 13  | **ACTIONS SYSTEM**                      |     ✅     |      ✅      |     ✅     | Fully refactored: actions-definitions.js (action metadata + object type actions), actions-manager.js (unified API with getActionsForGameObjectType + getActionsForBuildingType), actions-orchestration.js (UI logic). All 20 simulation functions call ActionsOrchestration directly as singletons (no scope threading). Building actions now declarative with filtering properties. Unified GameAction type across all action sources. |
| 14  | **UTILITY LAYERS**                      |     ✅     |      -       |     -      | @ts-check enabled on all definition files; utils still need @ts-check: building-utils.js, item-utils.js, path-utils.js, and instance files (building-instances.js, zombie-instances.js, path-instances.js, location-instances.js)                                                                                                                                                                                                       |

**Legend:** ✅ Complete | ⚠️ Partial/Needs Work | ❌ Missing

---

## Three-Tier Convention Pattern

The codebase follows a **three-tier pattern** for major game domains:

```
Definition Layer → Core Manager Layer → Game Logic Layer
```

Where:

- **Definition Layer**: Data structures, configuration, typed objects
- **Core Manager Layer**: Business logic, state management, event coordination
- **Game Logic Layer**: UI interactions, game flow, player-facing mechanics

---

## Detailed Domain Analysis

### ✅ COMPLETE & WELL-ORGANIZED

#### 1. **INVENTORY & ITEMS**

| Layer      | File                   | Status |
| ---------- | ---------------------- | ------ |
| Definition | `items-definitions.js` | ✅     |
| Core       | `inventory-manager.js` | ✅     |
| Logic      | `items.js`             | ✅     |

**Architecture:**

- **items-definitions.js**: Central repository for `ItemDefinition` typedefs and item metadata
- **inventory-manager.js**: Unified API with:
  - Query functions: `inventoryContains()`, `inventoryKnows()`, `inventoryItemAmount()`, `getFirstItemOfType()`, `getItemByName()`
  - Modification functions: `addItemToInventory()`, `addWeaponToInventory()`
  - State accessors: `getInventory()`, `getAllItems()`, `getItemDefinition()`, `getItemFromInventory()`
  - Variant handling: `inventoryContains()` and related functions handle ingredient variants (water, mushrooms, fruits)
  - Batching support: `beginInventoryBatch()`, `endInventoryBatch()` for multi-item operations
- **items.js**: UI layer consuming inventory manager API
- **Type System**: Full @ts-check with proper imports and typedefs

**Key Improvements:**

- All inventory query functions moved from items.js to inventory-manager.js
- Centralized variant handling logic
- Proper event emission with batching support
- Type-safe inventory operations

#### 2. **WORLD (Map, Buildings, Paths, Zombies)**

| Layer      | File                                                                                         | Status |
| ---------- | -------------------------------------------------------------------------------------------- | ------ |
| Definition | `building-definitions.js`                                                                    | ✅     |
| Instances  | `building-instances.js`, `zombie-instances.js`, `path-instances.js`, `location-instances.js` | ✅     |
| Core       | `map-initializer.js`                                                                         | ✅     |
| Logic      | `map.js`                                                                                     | ✅     |
| Utilities  | `building-utils.js`, `path-utils.js`                                                         | ✅     |

#### 3. **ACTIONS SYSTEM**

| Layer      | File                                        | Status |
| ---------- | ------------------------------------------- | ------ |
| Definition | `actions-definitions.js`                    | ✅     |
| Core       | `actions-manager.js`                        | ✅     |
| Logic      | `actions-orchestration.js`                  | ✅     |
| Metadata   | Building actions in building-definitions.js | ✅     |

**Architecture:**

- **actions-definitions.js**: Central repository for `actionProps` (execution config) and `objectTypeActions` (zombie/creature/animal/companion/weapon/event actions)
- **actions-manager.js**: Unified API with:
  - Card-based queries: `getCardActionObject()`, `isValid()`, `getCardBasedEnergy()`, `getCardBasedTime()`, etc.
  - Static properties: `getActionDelay()`, `getActionMethod()`, `getActionLabel()`
  - Type-based queries: `getActionsForGameObjectType(objectType)`, `getActionsForBuildingType(buildingName, buildingType, locked, infested, character)`
- **building-definitions.js**: Building actions now declarative with filtering properties: `excludeBuildings[]`, `excludeCharacters[]`, `forCharactersOnly[]`, `needsUnlock`, `requiresLocked`
- **actions-orchestration.js**: Core orchestration layer with simplified `fastForward()` (no scope threading); 20 simulation functions in `/js/actions/` all call methods directly as singletons
- **Simulation Functions**: chomping, drinking, fishing, gotit, reading, simulate-\* (20 total) - all refactored to call `ActionsOrchestration.endAction()` and `ActionsOrchestration.goBackFromAction()` directly
- **Unified Type System**: Single `GameAction` typedef used across all action sources with optional building-specific properties

**Key Improvements:**

- Removed ~80 lines of procedural filtering logic from building-utils.js
- Eliminated pipe-delimited string parsing
- Removed character modifier mutations from map-initializer
- **Complete scope threading removal**: All 20 simulation functions refactored to call ActionsOrchestration methods directly (no parameter passing through layers)
- Type system unified and safer

---

### ⚠️ INCOMPLETE (Missing Core Layer)

#### 4. **RECIPES (Cooking & Crafting)**

| Layer      | File                        | Status |
| ---------- | --------------------------- | ------ |
| Definition | `recipe-definitions.js`     | ✅     |
| Core       | `recipes-manager.js`        | ✅     |
| Logic      | `cooking.js`, `crafting.js` | ✅     |

**Architecture:**

- **recipe-definitions.js**: Central repository for `CookingRecipe`, `CraftingRecipe`, and `IngredientVariants` typedefs; defines all recipes and ingredient variant mappings
- **recipes-manager.js**: Unified API with:
  - Recipe accessors: `getCookingRecipes()`, `getCraftingRecipes()`
  - Recipe metadata: `getIngredientsForCookingRecipe()`, `getCookingMethod()`, `getCookingResultAmount()`, `getIngredientsForCraftingRecipe()`
  - Recipe validation: `isItemPartOfRecipe()`, `isItemPartOfCraftingRecipe()`
  - Recipe resolution: `resolveRecipeIngredients()` - handles ingredient variants and persistent ingredients
  - Variant accessors: `getIngredientVariants()`, `getPersistentIngredients()`
- **cooking.js**, **crafting.js**: UI layers using RecipesManager API
- **Type System**: Full @ts-check with proper imports and typedefs

**Key Improvements:**

- Centralized recipe logic in dedicated manager
- Automatic handling of ingredient variants and persistent ingredients
- Unified API for both cooking and crafting
- Type-safe recipe operations

#### 5. **ALMANAC**

| Layer      | File                     | Status |
| ---------- | ------------------------ | ------ |
| Definition | `almanac-definitions.js` | ✅     |
| Core       | `almanac-manager.js`     | ✅     |
| Logic      | `almanac.js`             | ✅     |

**Architecture:**

- **almanac-definitions.js**: Central repository for almanac content pages and known content state
- **almanac-manager.js**: Core manager providing unified API:
  - `makeContentKnown()` - mark content as discovered
  - `isContentKnown()` - query discovery status
  - `getAlmanacContentPage()` - retrieve content entries
  - Full @ts-check with proper type imports
- **almanac.js**: Logic layer using AlmanacManager API
- **Type System**: Full @ts-check with proper imports and typedefs

**Key Improvements:**

- Extracted content management logic into dedicated manager
- Centralized almanac state and discovery tracking
- Unified API for content operations

---

### ✅ COMPLETE & WELL-ORGANIZED (continued)

#### 7. **CHARACTER**

| Layer      | File                       | Status |
| ---------- | -------------------------- | ------ |
| Definition | `character-definitions.js` | ✅     |
| Core       | `character-manager.js`     | ✅     |
| Logic      | `character.js`             | ✅     |

**Architecture:**

- **character-definitions.js**: Central repository for character typedefs and character-specific properties
- **character-manager.js**: Core manager providing:
  - Preset accessors: `getInventoryPresets()` - retrieves character's starting inventory
  - Modifier accessors: `getItemModifier()` - returns item effect modifiers (hunger/thirst/energy) for specific characters
- **character.js**: Logic layer using CharacterManager API
- **Type System**: Full @ts-check with proper imports from definitions

**Key Improvements:**

- Extracted character-specific business logic from character.js into dedicated manager
- Centralized character stat modifiers and inventory presets
- Unified API for character-specific queries

### ⚠️ MIXED/SCATTERED PATTERNS

#### 8. **COMPANION**

| Layer      | File                       | Status |
| ---------- | -------------------------- | ------ |
| Definition | `companion-definitions.js` | ✅     |
| Core       | `companion-manager.js`     | ✅     |
| Logic      | `companion.js`             | ✅     |

**Status:** Companion system is properly separated. companion.js handles UI and interactions; companion-definitions.js provides data structure; companion-manager.js manages state. Well-organized pattern.

**Optimization Opportunity:**

- Move business logic from companion.js (`getCompanionFoodValue`, `feedCompanion`) to companion-manager.js
- Replace direct Props mutations in companion.js with CompanionManager API calls for better encapsulation

#### 8. **WEAPONS**

| Layer      | File                      | Status |
| ---------- | ------------------------- | ------ |
| Definition | `weapons-definitions.js`  | ✅     |
| Core       | `inventory-manager.js`    | ✅     |
| Logic      | `weapons.js`, `battle.js` | ✅     |

**Architecture:**

- **weapons-definitions.js**: Central repository for weapon metadata and definitions
- **inventory-manager.js**: Weapons are managed as inventory items and accessed via `addWeaponToInventory()` and related methods
- Weapons live entirely within the inventory system - no separate manager needed
- Read-only metadata access through `WeaponsDefinitions`
- **Type System**: Full @ts-check with proper imports

**Key Insight:** Weapons don't require a dedicated manager because they're fully integrated into the inventory system with read-only metadata lookup.

#### 9. **PLAYER STATS**

| Layer      | File                    | Status |
| ---------- | ----------------------- | ------ |
| Definition | `player-definitions.js` | ✅     |
| Core       | `player-manager.js`     | ✅     |
| Logic      | `player.js`             | ✅     |

**Status:** Fully organized with PlayerManager handling all player prop changes.

#### 10. **BATTLE/COMBAT**

| Layer      | File                    | Status |
| ---------- | ----------------------- | ------ |
| Definition | `battle-definitions.js` | ✅     |
| Core       | `battle-manager.js`     | ✅     |
| Logic      | `battle.js`             | ✅     |

**Architecture:**

- **battle-definitions.js**: Central repository for `CombatCard` typedef and battle constants
- **battle-manager.js**: Core manager providing unified combat API
- **battle.js**: Game logic layer coordinating battle flow
- **Type System**: Full @ts-check with proper imports and typedefs

**Key Improvements:**

- Extracted battle-specific data structures and constants into definitions layer
- Dedicated manager layer for combat logic encapsulation
- Unified API for battle operations

#### 11. **TUTORIAL**

| Layer      | File                      | Status |
| ---------- | ------------------------- | ------ |
| Definition | `tutorial-definitions.js` | ✅     |
| Core       | `tutorial-manager.js`     | ✅     |
| Logic      | `tutorial.js`             | ✅     |

**Architecture:**

- **tutorial-definitions.js**: Central repository for `TutorialEvent` and `SpecialEvent` typedefs; defines all tutorial events (with map coordinates) and special events (infestation, locked-building, corpse, etc.)
- **tutorial-manager.js**: Core manager providing:
  - Event accessors: `getTutorialEvents()`, `getSpecialEvents()`
  - Map setup: `setupTutorialMap()` - initializes tutorial-specific buildings, weapons, and zombies
  - Full @ts-check with proper type imports from definitions
- **tutorial.js**: Logic layer using TutorialManager API for `setupAllEvents()` and `setupSpecialEvent()`
- **Type System**: Full @ts-check with proper imports and typedefs

**Key Improvements:**

- Extracted hardcoded events and specialEvents from tutorial.js into definitions layer
- Created dedicated manager to encapsulate tutorial-specific initialization logic
- Unified API for accessing tutorial content and setting up tutorial maps

#### 12. **CARDS SYSTEM**

| Layer      | File                   | Status |
| ---------- | ---------------------- | ------ |
| Definition | `cards-definitions.js` | ✅     |
| Core       | `cards-manager.js`     | ✅     |
| Logic      | `cards.js`             | ✅     |

**Architecture:**

- **cards-definitions.js**: Central repository for `Card`, `CardDeck`, `BattleCard`, `BattleDeck`, `OpponentDeck` typedefs
- **cards-manager.js**: Core manager providing:
  - Deck access: `getCardDeck()`, `getOpponentDeck()`
  - Card operations: `addCardToCardDeck()`, `removeOpponentDeck()`, `cleanupCardDeck()`
  - Queries: `getAllZedsNearbyIds()`, `zedIsDead()` (checks if all opponent zombies are dead)
  - Card properties: `updateCardDeckProperties()` - calculates distances from player
  - Full @ts-check with proper type imports
- **cards.js**: UI layer managing card display and interaction
- **Type System**: Full @ts-check with proper imports and typedefs

**Key Improvements:**

- Centralized card deck management
- Type-safe card operations
- Decoupled deck logic from UI rendering

#### 13. **EVENT BUS**

| Layer | File               | Status |
| ----- | ------------------ | ------ |
| Core  | `event-manager.js` | ✅     |

**Architecture:**

- **event-manager.js**: Central event registry providing:
  - Standardized event types: `PLAYER_PROP_CHANGED`, `GAME_PROP_CHANGED`, `INVENTORY_CHANGED`, `FIRST_ITEM_ADDED`, `WEAPON_CHANGED`, `PLAYER_MOVE_TO`, `PLAYER_UPDATE`
  - PropChangeEvent typedef for typed event data
  - Convention: Event handlers should NEVER emit new events (no chaining) - events are for notifications only, not orchestration
  - Full @ts-check for type safety

**Key Improvements:**

- Decouples state changes from UI updates
- Prevents event chain reactions and cascading side effects
- Centralized event management for debugging and maintenance

#### 14. **ACTIONS SYSTEM**

| Layer      | File                                        | Status |
| ---------- | ------------------------------------------- | ------ |
| Definition | `actions-definitions.js`                    | ✅     |
| Core       | `actions-manager.js`                        | ✅     |
| Logic      | `actions-orchestration.js`                  | ✅     |
| Metadata   | Building actions in building-definitions.js | ✅     |

**Architecture:**

- **actions-definitions.js**: Central repository for `actionProps` (execution config) and `objectTypeActions` (zombie/creature/animal/companion/weapon/event actions)
- **actions-manager.js**: Unified API with:
  - Card-based queries: `getCardActionObject()`, `isValid()`, `getCardBasedEnergy()`, `getCardBasedTime()`, etc.
  - Static properties: `getActionDelay()`, `getActionMethod()`, `getActionLabel()`
  - Type-based queries: `getActionsForGameObjectType(objectType)`, `getActionsForBuildingType(buildingName, buildingType, locked, infested, character)`
- **building-definitions.js**: Building actions now declarative with filtering properties: `excludeBuildings[]`, `excludeCharacters[]`, `forCharactersOnly[]`, `needsUnlock`, `requiresLocked`
- **actions-orchestration.js**: Core orchestration layer with simplified `fastForward()` (no scope threading); 20 simulation functions in `/js/actions/` all call methods directly as singletons
- **Simulation Functions**: chomping, drinking, fishing, gotit, reading, simulate-\* (20 total) - all refactored to call `ActionsOrchestration.endAction()` and `ActionsOrchestration.goBackFromAction()` directly
- **Unified Type System**: Single `GameAction` typedef used across all action sources with optional building-specific properties
- **Type System**: Full @ts-check across all files

**Key Improvements:**

- Removed ~80 lines of procedural filtering logic from building-utils.js
- Eliminated pipe-delimited string parsing
- Removed character modifier mutations from map-initializer
- **Complete scope threading removal**: All 20 simulation functions refactored to call ActionsOrchestration methods directly (no parameter passing through layers)
- Type system unified and safer

---

## Type Safety Notes

**All definition files now have @ts-check:**

- ✅ actions-definitions.js
- ✅ almanac-definitions.js
- ✅ battle-definitions.js
- ✅ building-definitions.js
- ✅ cards-definitions.js
- ✅ character-definitions.js
- ✅ companion-definitions.js
- ✅ items-definitions.js
- ✅ player-definitions.js
- ✅ recipe-definitions.js
- ✅ tutorial-definitions.js
- ✅ weapons-definitions.js

**All core managers have @ts-check:**

- ✅ actions-manager.js
- ✅ almanac-manager.js
- ✅ battle-manager.js
- ✅ cards-manager.js
- ✅ character-manager.js
- ✅ companion-manager.js
- ✅ event-manager.js
- ✅ inventory-manager.js
- ✅ player-manager.js
- ✅ recipes-manager.js
- ✅ tutorial-manager.js
- ✅ All core modules (game-state.js, object-state.js, object-factory.js, etc.)

**Remaining files without @ts-check (utilities & instances):**

- building-utils.js
- item-utils.js
- path-utils.js
- building-instances.js
- zombie-instances.js
- path-instances.js
- location-instances.js
