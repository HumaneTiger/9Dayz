# 9Dayz Architecture: Convention Analysis

## Quick Reference Matrix

| #   | Domain                                  | Definition | Core Manager | Game Logic | Key Insights                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | --------------------------------------- | :--------: | :----------: | :--------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **INVENTORY & ITEMS**                   |     ✅     |      ⚠️      |     ✅     | Inventory query functions (inventoryContains, inventoryKnows, inventoryItemAmount, getFirstItemOfType, getItemByName) scattered in items.js; should be moved to inventory-manager.js                                                                                                                                                                                                                                                                                                                                   |
| 2   | **WORLD** (Map/Buildings/Paths/Zombies) |     ✅     |      ✅      |     ✅     | Pattern to follow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 3   | **RECIPES** (Cooking & Crafting)        |     ✅     |      ❌      |     ✅     | Both cooking.js and crafting.js directly import RecipeDefinitions; need recipes-manager.js                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4   | **ALMANAC**                             |     ✅     |      ❌      |     ✅     | Need almanac-manager.js to manage content unlocking and lifecycle                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 5   | **CHARACTER**                           |     ✅     |      ⚠️      |     ✅     | Character state lives in game-state.js; need dedicated character-manager.js                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 6   | **COMPANION**                           |     ❌     |      ❌      |     ⚠️     | Companion typedef in game-state.js; UI mixed in character.js; need companion-definitions.js + companion-manager.js; `// todo: split` comment exists                                                                                                                                                                                                                                                                                                                                                                    |
| 7   | **WEAPONS**                             |     ✅     |      ⚠️      |     ✅     | Creation logic in object-factory.js, combat in battle.js; need weapons-manager.js                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8   | **PLAYER STATS**                        |     ⚠️     |      ✅      |     ✅     | PlayerProps typedef in game-state.js; need player-definitions.js file                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 9   | **BATTLE/COMBAT**                       |     ❌     |      ⚠️      |     ✅     | No battle-definitions.js; core logic mixed between object-factory.js and battle.js                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 10  | **TUTORIAL**                            |     ❌     |      ✅      |     ✅     | Massive hardcoding in tutorial.js: events object (with coordinates/titles/text), specialEvents object, battleTutorialStep; need tutorial-definitions.js                                                                                                                                                                                                                                                                                                                                                                |
| 11  | **UTILITY LAYERS**                      |     ✅     |      -       |     -      | Add @ts-check to all utils (building-utils, item-utils, path-utils, instances)                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 12  | **ACTIONS SYSTEM**                      |     ❌     |      ❌      |     ⚠️     | **CRITICAL:** 859-line monolith! Contains actionProps metadata (~300 LOC), orchestration logic (~300 LOC), and implementations (~300 LOC) all mixed. Split into: actions-definitions.js (actionProps config), actions-manager.js (core orchestration), actions.js (UI logic). **DEPENDENCY:** building-utils.js contains getBuildingActionsFor() with hardcoded action filtering logic (building+action combos, character restrictions, needsUnlock computations) - will need refactoring when actions system is split |

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

#### 2. **WORLD (Map, Buildings, Paths, Zombies)**

| Layer      | File                                                                                         | Status |
| ---------- | -------------------------------------------------------------------------------------------- | ------ |
| Definition | `building-definitions.js`                                                                    | ✅     |
| Instances  | `building-instances.js`, `zombie-instances.js`, `path-instances.js`, `location-instances.js` | ✅     |
| Core       | `map-initializer.js`                                                                         | ✅     |
| Logic      | `map.js`                                                                                     | ✅     |
| Utilities  | `building-utils.js`, `path-utils.js`                                                         | ✅     |

---

### ⚠️ INCOMPLETE (Missing Core Layer)

#### 3. **RECIPES (Cooking & Crafting)**

| Layer      | File                                                              | Status |
| ---------- | ----------------------------------------------------------------- | ------ |
| Definition | `recipe-definitions.js`                                           | ✅     |
| Core       | **→ MISSING**                                                     | ❌     |
| Logic      | `cooking.js`, `crafting.js`                                       | ✅     |
| Note       | Both cooking.js and crafting.js directly import RecipeDefinitions | ⚠️     |

**Gap:** No `recipes-manager.js` core layer to coordinate recipe logic, validation, and state.

#### 4. **ALMANAC**

| Layer      | File                 | Status |
| ---------- | -------------------- | ------ |
| Definition | `almanac-content.js` | ✅     |
| Core       | **→ MISSING**        | ❌     |
| Logic      | `almanac.js`         | ✅     |

**Gap:** No `almanac-manager.js` core layer to manage content unlocking and lifecycle.

---

### ⚠️ MIXED/SCATTERED PATTERNS

#### 5. **CHARACTER**

| Layer      | File                       | Status |
| ---------- | -------------------------- | ------ |
| Definition | `character-definitions.js` | ✅     |
| Core       | `game-state.js` (partial)  | ⚠️     |
| Logic      | `character.js`             | ✅     |

**Issue:** Character state lives in game-state but there's no dedicated character-manager core layer.

#### 6. **COMPANION**

| Layer      | File                                               | Status |
| ---------- | -------------------------------------------------- | ------ |
| Definition | **→ NONE**                                         | ❌     |
| Core       | **→ MIXED in game-state.js**                       | ❌     |
| Logic      | `character.js` (mixed with character)              | ⚠️     |
| Note       | Companion object in game-state; UI in character.js | ⚠️     |

**Issues:**

- No companion-definitions.js (Companion typedef is in game-state.js)
- No companion-manager.js core layer
- Conflated with character UI in character.js
- Internal comment: `// todo: split into character, companion`

#### 7. **WEAPONS**

| Layer      | File                      | Status |
| ---------- | ------------------------- | ------ |
| Definition | `weapons-definitions.js`  | ✅     |
| Core       | **→ SCATTERED**           | ⚠️     |
| Logic      | `weapons.js`, `battle.js` | ✅     |

**Issues:**

- Weapon creation logic in `object-factory.js`
- Combat/damage logic in `battle.js`
- No dedicated `weapons-manager.js` core layer

#### 8. **PLAYER STATS**

| Layer      | File            | Status |
| ---------- | --------------- | ------ |
| Definition | **→ IMPLICIT**  | ⚠️     |
| Core       | `game-state.js` | ✅     |
| Logic      | `player.js`     | ✅     |

**Gap:** PlayerProps typedef in game-state.js but no separate `player-definitions.js` file.

#### 9. **BATTLE/COMBAT**

| Layer      | File            | Status |
| ---------- | --------------- | ------ |
| Definition | **→ NONE**      | ❌     |
| Core       | **→ SCATTERED** | ❌     |
| Logic      | `battle.js`     | ✅     |

**Issues:**

- No battle-definitions.js or combat-definitions.js
- Core logic mixed between object-factory.js and battle.js
- No dedicated battle-manager.js

#### 10. **TUTORIAL**

| Layer      | File                      | Status |
| ---------- | ------------------------- | ------ |
| Definition | **→ HARDCODED**           | ⚠️     |
| Core       | `tutorial-initializer.js` | ✅     |
| Logic      | `tutorial.js`             | ✅     |

**Gap:** Tutorial setup is hardcoded in tutorial-initializer.js; no tutorial-definitions.js

---

## Summary Statistics

| Category                     | Count  |
| ---------------------------- | ------ |
| ✅ Complete Patterns         | 2      |
| ⚠️ Incomplete (missing core) | 2      |
| ⚠️ Mixed/Scattered           | 6      |
| ❌ Multiple Major Gaps       | 1      |
| **Total Domains**            | **11** |

---

## Priority Refactoring Order

### Phase 1: Fill Critical Gaps (Missing Core Layers)

1. **recipes-manager.js** - Consolidate cooking/crafting logic
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

- ✅ building-definitions.js
- ✅ weapons-definitions.js
- ✅ items-definitions.js
- ✅ character-definitions.js
- ✅ loot-utils.js
- ✅ All core modules (game-state.js, object-state.js, object-factory.js, etc.)

**Missing @ts-check (candidates for Phase 1 of type coverage):**

- recipe-definitions.js
- building-utils.js
- item-utils.js
- path-utils.js
- All instance files
