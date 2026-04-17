import Props from './props.js';
import Items from './items.js';
import Player from './player.js';
import Events, { EVENTS } from './core/event-manager.js';
import TimingUtils from './utils/timing-utils.js';
import { RecipesManager, AlmanacManager, GameState } from './core/index.js';

const craftingOptions = Props.getCrafting();
const craftContainer = document.getElementById('craft');
const craftingRecipes = RecipesManager.getCraftingRecipes();

export default {
  init: function () {
    craftContainer.addEventListener('mouseover', this.checkCraftActionHover.bind(this));
    craftContainer.addEventListener('mousedown', this.checkCraftActionClick.bind(this));
    this.checkCraftingPrerequisits();

    // EVENT: React to inventory changes
    Events.on(EVENTS.INVENTORY_CHANGED, () => {
      this.checkCraftingPrerequisits();
    });
    Events.on(EVENTS.WEAPON_CHANGED, () => {
      this.checkCraftingPrerequisits();
    });
  },

  checkCraftActionHover: function (ev) {
    const target = ev.target;
    const hoverButton = target.closest('.button-craft');

    // better do these checks based on props
    // const item = clickButton.dataset.item;
    if (hoverButton) {
      if (hoverButton.classList.contains('active')) {
        craftContainer.querySelector('p.info').textContent =
          'Click to ' + hoverButton.dataset.action + ' (right-click for info)';
      } else if (hoverButton.classList.contains('only1')) {
        craftContainer.querySelector('p.info').textContent = "Can't do - can carry only one";
      } else {
        craftContainer.querySelector('p.info').textContent = "Can't do - items missing";
      }
    } else {
      craftContainer.querySelector('p.info').textContent = '';
    }
  },

  checkCraftActionClick: function (ev) {
    const target = ev.target;
    const clickButton = target.closest('.button-craft');
    const navButton = target.closest('.button-next') || target.closest('.button-prev');
    const leftMouseButton = ev.button === 0;

    if (clickButton && clickButton.classList.contains('active') && leftMouseButton) {
      // relying heavily on active class for verification
      const item = clickButton.dataset.item;
      const itemRecipe = craftingRecipes[item];
      if (itemRecipe !== undefined) {
        // first - always remove needed recipe items
        for (const recipeItem in itemRecipe.items) {
          if (itemRecipe.items[recipeItem].length === 1) {
            if (!this.preserveCraftingItem(itemRecipe.items[recipeItem][0])) {
              Props.addItemToInventory(itemRecipe.items[recipeItem][0], -1);
            }
          } else {
            for (const orItem in itemRecipe.items[recipeItem]) {
              if (Items.inventoryContains(itemRecipe.items[recipeItem][orItem])) {
                // consume first one that is found
                if (!this.preserveCraftingItem(itemRecipe.items[recipeItem][0])) {
                  Props.addItemToInventory(itemRecipe.items[recipeItem][orItem], -1);
                }
                break;
              }
            }
          }
        }
        // second - create the crafting result (add inventory item or create weapon/building card)
        if (itemRecipe.result === 'inventory') {
          Props.addItemToInventory(item, itemRecipe.amount ?? 1);
        } else {
          // create a card of sort
          const here = Player.getPlayerPosition();
          if (itemRecipe.result === 'weapon') {
            Props.setupWeapon(here.x, here.y, item);
            AlmanacManager.makeContentKnown(item);
          } else if (itemRecipe.result === 'building') {
            Props.setupBuilding(here.x, here.y, new Array(item));
          }
          Player.findAndHandleObjects();
          craftContainer.classList.remove('active');
          // make crafted item known in almanac
          Events.emit(EVENTS.FIRST_ITEM_ADDED, {
            item: item,
          });
        }
      }
    } else if (navButton && leftMouseButton) {
      const panel = navButton.dataset.panel;
      craftContainer.querySelector('.inner.craft-1').classList.add('is--hidden');
      craftContainer.querySelector('.inner.craft-2').classList.add('is--hidden');
      craftContainer.querySelector('.inner.craft-3').classList.add('is--hidden');
      craftContainer.querySelector('.inner.' + panel).classList.remove('is--hidden');
    }
  },

  preserveCraftingItem: function (item) {
    if (item === 'knife') {
      return true;
    } else {
      return false;
    }
  },

  checkCraftingPrerequisits: function () {
    for (const recipe in craftingRecipes) {
      const itemRecipe = craftingRecipes[recipe];

      const neededAmounts = RecipesManager.getNeededIngredientAmounts(recipe);
      const craftContainerPage = craftContainer.querySelector(`.inner.craft-${itemRecipe.page}`);

      /* give feedback for each required item */
      for (const recipeItem in itemRecipe.items) {
        const isOneAvailable = RecipesManager.isIngredientGroupAvailable(
          itemRecipe.items[recipeItem]
        );
        const isAllAvailable = RecipesManager.isIngredientGroupAvailable(
          itemRecipe.items[recipeItem],
          neededAmounts
        );
        const firstIngredient = itemRecipe.items[recipeItem][0];
        if (recipe === 'plant-pot') {
          console.log('checking plant-pot ingredient visibility for ', firstIngredient);
          console.log('is one available?', isOneAvailable);
          console.log('is all available?', isAllAvailable);
          console.log('needed amounts', neededAmounts[firstIngredient]);
        }
        craftContainerPage
          .querySelectorAll(`.nope.${firstIngredient}:not(.additional)`)
          .forEach(el => {
            if (isOneAvailable) {
              el.classList.add('is--hidden');
            } else {
              el.classList.remove('is--hidden');
            }
          });

        /* currently only rope needs two of the same */
        if (neededAmounts[firstIngredient] > 1) {
          if (isAllAvailable) {
            craftContainerPage
              .querySelector(`.nope.${firstIngredient}.additional.c-${recipe}`)
              ?.classList.add('is--hidden');
          } else {
            craftContainerPage
              .querySelector(`.nope.${firstIngredient}.additional.c-${recipe}`)
              ?.classList.remove('is--hidden');
          }
        }
      }

      /* set crafting button state */
      const prerequisitsFulfilled = RecipesManager.isCraftingPrerequisitsFulfilled(recipe);
      if (prerequisitsFulfilled) {
        if (itemRecipe.exclusive && Items.inventoryContains(recipe)) {
          craftContainer
            .querySelector(`.button-craft[data-item="${recipe}"]`)
            ?.classList.remove('active');
          craftContainer
            .querySelector(`.button-craft[data-item="${recipe}"]`)
            ?.classList.add('only1');
        } else {
          craftContainer
            .querySelector(`.button-craft[data-item="${recipe}"]`)
            ?.classList.add('active');
          craftContainer
            .querySelector(`.button-craft[data-item="${recipe}"]`)
            ?.classList.remove('only1');
        }
      } else {
        craftContainer
          .querySelector(`.button-craft[data-item="${recipe}"]`)
          ?.classList.remove('active');
      }
    }

    const craftingOptionsPage1 = RecipesManager.numberOfActiveCraftingRecipes(1);
    const craftingOptionsPage2 = RecipesManager.numberOfActiveCraftingRecipes(2);
    const craftingOptionsPage3 = RecipesManager.numberOfActiveCraftingRecipes(3);

    /* update crafting info next to page navigation buttons */
    craftContainer.querySelector('.button-next[data-panel="craft-2"] .amount').textContent =
      craftingOptionsPage2 + craftingOptionsPage3;
    craftContainer.querySelector('.button-prev[data-panel="craft-1"] .amount').textContent =
      craftingOptionsPage1;
    craftContainer.querySelector('.button-next[data-panel="craft-3"] .amount').textContent =
      craftingOptionsPage3;
    craftContainer.querySelector('.button-prev[data-panel="craft-2"] .amount').textContent =
      craftingOptionsPage2 + craftingOptionsPage1;

    /* update total crafting info */
    const craftingOptionsTotal = craftingOptionsPage1 + craftingOptionsPage2 + craftingOptionsPage3;
    if (craftingOptionsTotal !== craftingOptions.total) {
      craftingOptions.total = craftingOptionsTotal;
      this.craftingChangeFeedback();
    }
  },

  craftingChangeFeedback: async function () {
    if (GameState.getGameProp('onBoard')) {
      document.getElementById('crafting-total').textContent = craftingOptions.total + `+?`;
    } else {
      document.getElementById('crafting-total').textContent = craftingOptions.total;
    }
    document.querySelector('#actions .craft').classList.add('transfer');
    await TimingUtils.waitForTransition(document.querySelector('#actions .craft'));
    await TimingUtils.wait(100);
    document.querySelector('#actions .craft').classList.remove('transfer');
  },
};
