# Weapons Refactoring Plan: Split Inventory & Weapons

## Overview

**Feasibility Assessment: HIGHLY DOABLE** ✅

Your plan is well-structured. The facade pattern in `props.js` already exists and makes this significantly easier. However, there are several roadbumps to consider.

---

## Strategic Approach

Your proposed path is solid:

1. Each function has a facade in `props.js` → makes routing trivial
2. Type safety first (TS check) → catch migration errors early
3. Split definitions → `items-definitions.js` and `weapons-definitions.js`
4. Split game logic → new `WeaponsManager` and `weapons.js` UI module

---

## Roadbumps & Considerations

### 1. Core Logic Challenges

**ROADBUMP: Dual Storage Model**

- Weapons currently live in `inventory.items` (same as regular items) with type `'extra'`
- The system uses `type` field to differentiate:
  - `'extra'` = weapons
  - `'eat'`, `'craft'`, `'drink'` = items
- You'll need to decide: migrate weapons to separate storage OR keep hybrid model but logically separate the paths

**RECOMMENDATION:** Create a parallel `weapons` object in inventory state:

```javascript
var inventory = {
  items: [...],        // non-weapons only
  weapons: {...},      // weapons only
  itemNumbers: 0,
  // Remove leftHand/rightHand - not actually used
};
```

### 2. Definition Split Issues

**ROADBUMP: The "Combo Name" Problem**

- `items-weapons-definitions.js` currently has weapon entries mixed with items:
  ```javascript
  'improvised-axe': ['extra', 0, 0, 0, weaponProps['improvised-axe'].attack, ...]
  ```
- These need to be completely separated

**RECOMMENDATION:** Create two independent definition files with no cross-imports:

```javascript
// weapons-definitions.js - NEW
export default {
  weaponProps: {...},
  weaponPropsUpgrades: {...}
}

// items-definitions.js - NEW (or rename current to this)
// Contains only non-weapon items, weapon entries removed completely
export default {
  items: {...}
}
```

Both are standalone, imported independently by other modules.

### 3. Game Logic Split (items.js)

**ROADBUMP: Mixed Concerns in `items.js`**

- Currently handles ALL inventory UI/logic: eating, drinking, crafting integration
- Weapons have separate upgrade logic in `character.js` (upgrade buttons, durability)
- No centralized weapon interaction handler exists

**WHAT NEEDS DOING:**

- Create `weapons.js` to mirror `items.js` structure
- Move weapon slot hover/click from `character.js` to `weapons.js`
- Handle the split of `WEAPON_CHANGED` event listeners

**HIDDEN COMPLEXITY:** The `character.js` file has a TODO comment:

```javascript
/* todo: split into character, companion and weapon modules */
```

This is exactly what you need to do for weapons.

### 4. Props.js Facade Layer

**ROADBUMP: Already Clean, But Needs Updates**

- Props.js already has weapon facades: `addWeaponToInventory`, `getWeaponTotal`, `getWeaponProps`, `getWeaponPropsUpgrades`
- Easy part: just update these to delegate to `WeaponsManager` instead of `InventoryManager`
- **You don't need to change call sites** - they route through props.js

**Existing Facades to Split:**

```javascript
// Move these to WeaponsManager delegation:
-addWeaponToInventory() - getWeaponTotal() - getWeaponProps() - getWeaponPropsUpgrades();
```

### 5. Cross-File Dependencies to Monitor

**ROADBUMP: Scattered Weapon Logic**

These files check for weapon type using `itemProps[0] === 'extra'`:

- `actions.js` (line 315) - picks up weapons differently
- `items.js` - indirectly via slot rendering
- `character.js` - weapon slot rendering and upgrades
- `editor.js` (line 68) - hardcoded weapon list checks
- `crafting.js` - checks recipe results

**ACTION NEEDED:** Create a utility function:

```javascript
// WeaponsUtils or in InventoryUtils
isWeapon(itemName) { return items[itemName]?.[0] === 'extra'; }
```

Then update all check sites to use this single function.

### 6. Event System Split

**Currently:**

- `INVENTORY_CHANGED` fires for items
- `WEAPON_CHANGED` fires for weapons
- Both listeners exist in `items.js`, `character.js`, `crafting.js`

**ROADBUMP:** The batching system treats both under `inventoryBatch`

**RECOMMENDATION:** Keep the event split but consider separate batching for weapons, or unify the system. Currently works, but semantically odd.

---

## Additional Refactoring Opportunities

### 1. Unused State ✓

- `leftHand` and `rightHand` in inventory - **NEVER USED** in the codebase
- Remove them as part of this refactor

### 2. Type Safety (Your First Step) ✓

- The TS check will catch weapon type mismatches early
- **FLAG:** Once you split, ensure these weapon objects maintain consistent shape:

  ```typescript
  interface Weapon {
    type: 'extra';
    name: string;
    amount: number;
    damage: number;
    protection: number;
    durability: number;
  }

  interface Item {
    type: 'eat' | 'drink' | 'craft';
    name: string;
    amount: number;
    damage?: number;
    protection?: number;
  }
  ```

### 3. Visual Layer

- `character.js` has TODO: `split into character, companion and weapon modules`
- This is where your `weapons.js` game logic interacts with UI

---

## Suggested Implementation Order

### Phase 1: Foundation & Type Safety

1. **Add TypeScript definitions** - define Weapon and Item interfaces
2. **Add utility function** - `isWeapon(itemName)` in ItemUtils or new WeaponsUtils
3. **Create WeaponsDefinitions** - extract weapon data to separate file

### Phase 2: Manager Layer

4. **Create WeaponsManager** - copy relevant methods from InventoryManager
   - `addWeaponToInventory()`
   - `getWeaponTotal()`
   - Separate weapon state management
5. **Update InventoryManager** - remove weapon-specific logic
   - Keep weapon reference removal from `inventory.items`
   - Update `calcTotalInventoryItems()` to ignore weapons

### Phase 3: Facade Updates

6. **Update Props.js routes** - point weapon methods to WeaponsManager
   - Keep same method signatures
   - No call site changes needed

### Phase 4: UI & Game Logic

7. **Create weapons.js** - UI/interaction logic (mirror of items.js)
   - Weapon slot hover/click
   - Weapon upgrades
   - Event listening for WEAPON_CHANGED
8. **Update Character.js** - move weapon slot logic to weapons.js
9. **Update all weapon type checks** - use new `isWeapon()` utility

### Phase 5: Cleanup

10. **Remove dead code**
    - `leftHand`/`rightHand` properties
    - Unused weapon-related methods
11. **Test & Verify** - run TS check, ensure no broken references

---

## Implementation Checklist

### Files to Create

- [ ] `data/definitions/weapons-definitions.js` - standalone weapons data
- [ ] `js/core/weapons-manager.js`
- [ ] `js/weapons.js`

### Files to Modify

- [ ] `data/definitions/items-weapons-definitions.js` - remove weapon entries, keep only items
- [ ] `data/definitions/index.js` - export WeaponsDefinitions (new) and update ItemsDefinitions
- [ ] `data/utils/item-utils.js` - add `isWeapon()` utility
- [ ] `js/core/inventory-manager.js` - remove weapon logic
- [ ] `js/props.js` - update routing to WeaponsManager
- [ ] `js/character.js` - remove weapon slots logic, keep companion logic
- [ ] `js/actions.js` - update weapon type checks to use `isWeapon()`
- [ ] `js/editor.js` - update weapon list checks
- [ ] `js/crafting.js` - update weapon type checks
- [ ] `js/items.js` - remove weapon-related code

### Files to Review (No changes needed, but verify compatibility)

- [ ] `js/battle.js` - weapon damage/protection calculations
- [ ] `js/cards.js` - ensure weapon cards still work
- [ ] `js/core/object-factory.js` - weapon spawning logic

---

## Risk Assessment

| Aspect                     | Risk Level | Mitigation                          |
| -------------------------- | ---------- | ----------------------------------- |
| Type safety catches errors | 🟢 Low     | Run TS check after each phase       |
| Props.js routing hidden    | 🟢 Low     | Facades stay the same               |
| Scattered weapon checks    | 🟡 Medium  | Create `isWeapon()` utility first   |
| Event listener split       | 🟡 Medium  | Keep both events, separate handlers |
| Character.js coupling      | 🟡 Medium  | Extract weapon module carefully     |
| Unused weapon properties   | 🟢 Low     | Simply remove, no dependencies      |

---

## Testing Strategy

1. **After Type Safety Phase:** Run TS check, verify no new errors
2. **After Manager Creation:** Console log weapon operations to verify routing
3. **After Props.js Update:** Verify all weapon operations still work in UI
4. **After weapons.js Creation:** Test weapon pickup, equipping, upgrading
5. **After All Changes:** Run full game through tutorial and normal gameplay
6. **Final Check:** Search codebase for any remaining `'extra'` type checks

---

## Summary

| Aspect                 | Difficulty           | Status                       |
| ---------------------- | -------------------- | ---------------------------- |
| Props.js routing       | 🟢 Easy              | Already structured           |
| InventoryManager split | 🟡 Medium            | Need clear state model       |
| Definitions split      | 🟡 Medium            | Circular dependency handling |
| items.js → weapons.js  | 🟡 Medium            | Clear patterns exist         |
| Type safety            | 🟢 Easy              | TS will guide you            |
| **Overall**            | 🟢 **HIGHLY DOABLE** | Well-planned approach        |

The biggest roadbump is **deciding whether to truly separate weapon storage or keep hybrid model** – everything else follows from that decision. The recommendation is to separate: `inventory.items` for items, `inventory.weapons` for weapons.

---

## Notes for Implementation

- Keep the event system as-is (`INVENTORY_CHANGED` vs `WEAPON_CHANGED`) - it's already working
- The facade pattern in `props.js` is your best friend - no call site changes needed
- Type safety will catch 90% of migration issues automatically
- Start with `isWeapon()` utility - this alone will make scattered logic much cleaner
- Don't remove `leftHand`/`rightHand` until you've verified they're truly unused in production
