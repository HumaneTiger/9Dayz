# 9Dayz Architecture: Convention Analysis

## Quick Reference Matrix

| #   | Domain                                  | Definition | Core Manager | Game Logic | Key Insights                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | --------------------------------------- | :--------: | :----------: | :--------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **INVENTORY & ITEMS**                   |     ✅     |      ✅      |     ✅     | Inventory query functions (inventoryContains, inventoryKnows, inventoryItemAmount, getFirstItemOfType, getItemByName) moved to inventory-manager.js; items.js now delegates to InventoryManager                                                                                                                                                                                                                                         |
| 2   | **WORLD** (Map/Buildings/Paths/Zombies) |     ✅     |      ✅      |     ✅     | Pattern to follow                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 3   | **RECIPES** (Cooking & Crafting)        |     ✅     |      ✅      |     ✅     | recipes-manager.js created with unified API; cooking.js and crafting.js now use RecipesManager                                                                                                                                                                                                                                                                                                                                          |
| 4   | **ALMANAC**                             |     ✅     |      ❌      |     ✅     | Need almanac-manager.js to manage content unlocking and lifecycle                                                                                                                                                                                                                                                                                                                                                                       |
| 5   | **CHARACTER**                           |     ✅     |      ⚠️      |     ✅     | Character state lives in game-state.js; need dedicated character-manager.js                                                                                                                                                                                                                                                                                                                                                             |
| 6   | **COMPANION**                           |     ✅     |      ✅      |     ✅     | Companion system now has companion-definitions.js and companion-manager.js; UI logic split in character.js and companion.js                                                                                                                                                                                                                                                                                                             |
| 7   | **WEAPONS**                             |     ✅     |      ⚠️      |     ✅     | Creation logic in object-factory.js, combat in battle.js; need weapons-manager.js                                                                                                                                                                                                                                                                                                                                                       |
| 8   | **PLAYER STATS**                        |     ✅     |      ✅      |     ✅     | Fully refactored with player-definitions.js and player-manager.js; PlayerManager handles all player prop changes                                                                                                                                                                                                                                                                                                                        |
| 9   | **BATTLE/COMBAT**                       |     ❌     |      ⚠️      |     ✅     | No battle-definitions.js; core logic mixed between object-factory.js and battle.js                                                                                                                                                                                                                                                                                                                                                      |
| 10  | **TUTORIAL**                            |     ❌     |      ✅      |     ✅     | Massive hardcoding in tutorial.js: events object (with coordinates/titles/text), specialEvents object, battleTutorialStep; need tutorial-definitions.js                                                                                                                                                                                                                                                                                 |
| 11  | **UTILITY LAYERS**                      |     ✅     |      -       |     -      | Add @ts-check to all utils (building-utils, item-utils, path-utils, instances)                                                                                                                                                                                                                                                                                                                                                          |
| 12  | **ACTIONS SYSTEM**                      |     ✅     |      ✅      |     ✅     | Fully refactored: actions-definitions.js (action metadata + object type actions), actions-manager.js (unified API with getActionsForGameObjectType + getActionsForBuildingType), actions-orchestration.js (UI logic). All 20 simulation functions call ActionsOrchestration directly as singletons (no scope threading). Building actions now declarative with filtering properties. Unified GameAction type across all action sources. |

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

| Layer      | File                 | Status |
| ---------- | -------------------- | ------ |
| Definition | `almanac-content.js` | ✅     |
| Core       | **→ MISSING**        | ❌     |
| Logic      | `almanac.js`         | ✅     |

**Gap:** No `almanac-manager.js` core layer to manage content unlocking and lifecycle.

---

### ⚠️ MIXED/SCATTERED PATTERNS

#### 7. **CHARACTER**

| Layer      | File                       | Status |
| ---------- | -------------------------- | ------ |
| Definition | `character-definitions.js` | ✅     |
| Core       | `game-state.js` (partial)  | ⚠️     |
| Logic      | `character.js`             | ✅     |

**Issue:** Character state lives in game-state but there's no dedicated character-manager core layer.

#### 8. **COMPANION**

| Layer      | File                       | Status |
| ---------- | -------------------------- | ------ |
| Definition | `companion-definitions.js` | ✅     |
| Core       | `companion-manager.js`     | ✅     |
| Logic      | `character.js`             | ⚠️     |

**Status:** Companion system now has dedicated definitions and manager. UI still mixed in character.js but core logic is properly separated.

#### 9. **WEAPONS**

| Layer      | File                      | Status |
| ---------- | ------------------------- | ------ |
| Definition | `weapons-definitions.js`  | ✅     |
| Core       | **→ SCATTERED**           | ⚠️     |
| Logic      | `weapons.js`, `battle.js` | ✅     |

**Issues:**

- Weapon creation logic in `object-factory.js`
- Combat/damage logic in `battle.js`
- No dedicated `weapons-manager.js` core layer

#### 9. **PLAYER STATS**

| Layer      | File                    | Status |
| ---------- | ----------------------- | ------ |
| Definition | `player-definitions.js` | ✅     |
| Core       | `player-manager.js`     | ✅     |
| Logic      | `player.js`             | ✅     |

**Status:** Fully organized with PlayerManager handling all player prop changes.

#### 11. **BATTLE/COMBAT**

| Layer      | File            | Status |
| ---------- | --------------- | ------ |
| Definition | **→ NONE**      | ❌     |
| Core       | **→ SCATTERED** | ❌     |
| Logic      | `battle.js`     | ✅     |

**Issues:**

- No battle-definitions.js or combat-definitions.js
- Core logic mixed between object-factory.js and battle.js
- No dedicated battle-manager.js

#### 12. **TUTORIAL**

| Layer      | File                      | Status |
| ---------- | ------------------------- | ------ |
| Definition | **→ HARDCODED**           | ⚠️     |
| Core       | `tutorial-initializer.js` | ✅     |
| Logic      | `tutorial.js`             | ✅     |

**Gap:** Tutorial setup is hardcoded in tutorial-initializer.js; no tutorial-definitions.js

#### 13. **UTILITY LAYERS**

TBD

---

## Summary Statistics

| Category                     | Count  |
| ---------------------------- | ------ |
| ✅ Complete Patterns         | 5      |
| ⚠️ Incomplete (missing core) | 1      |
| ⚠️ Mixed/Scattered           | 5      |
| ❌ Multiple Major Gaps       | 1      |
| **Total Domains**            | **12** |

---

## Priority Refactoring Order

### Phase 1: Fill Critical Gaps (Missing Core Layers)

1. ~~**recipes-manager.js**~~ ✅ DONE - Consolidate cooking/crafting logic
2. **almanac-manager.js** - Manage content unlocking

### Phase 2: Separate Conflated Domains

3. **companion-manager.js** + **companion-definitions.js** - Extract from character
4. Refactor **character.js** to separate character and companion UI

### Phase 3: Consolidate Scattered Logic

5. **weapons-manager.js** - Unify weapon creation and upgrade logic
6. **battle-definitions.js** - Define combat constants and formulas
7. Extract core battle logic to dedicated layer

### Phase 4: Formalize Implicit Patterns

8. **player-definitions.js** - Extract PlayerProps and related typedefs
9. **tutorial-definitions.js** - Extract hardcoded tutorial setup

---

## Type Safety Notes

**Already @ts-check enabled:**

- ✅ actions-definitions.js
- ✅ actions-manager.js
- ✅ building-definitions.js
- ✅ weapons-definitions.js
- ✅ items-definitions.js
- ✅ character-definitions.js
- ✅ recipe-definitions.js
- ✅ recipes-manager.js
- ✅ inventory-manager.js
- ✅ loot-utils.js
- ✅ All core modules (game-state.js, object-state.js, object-factory.js, etc.)

**Missing @ts-check (candidates for Phase 1 of type coverage):**

- recipe-definitions.js
- building-utils.js
- item-utils.js
- path-utils.js
- All instance files
