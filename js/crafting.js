import Binding from './binding.js';
import Props from './props.js';
import Items from './items.js';
import Player from './player.js';
import Almanac from './almanac.js';
import RecipeDefinitions from '../data/definitions/recipe-definitions.js';

const craftingOptions = Props.getCrafting();
const craftContainer = document.getElementById('craft');
const craftingRecipes = RecipeDefinitions.craftingRecipes;

export default {
  init: function () {
    craftContainer.addEventListener('mouseover', this.checkCraftActionHover.bind(this));
    craftContainer.addEventListener('mousedown', this.checkCraftActionClick.bind(this));
    this.bind();
    this.checkCraftingPrerequisits();
  },

  bind: function () {
    new Binding({
      object: Props.getCrafting(),
      property: 'total',
      element: document.getElementById('crafting-total'),
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
        craftContainer.querySelector('p.info').textContent =
          "Can't do - items missing (right-click for info)";
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
    const rightMouseButton = ev.button === 2;

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
          } else if (itemRecipe.result === 'building') {
            Props.setupBuilding(here.x, here.y, [item]);
          }
          Player.findAndHandleObjects();
          craftContainer.classList.remove('active');
        }
        // third - communicate inventory change
        Items.inventoryChangeFeedback();
        Items.fillInventorySlots();
      }
    } else if (clickButton && rightMouseButton) {
      const item = clickButton.dataset.item;
      Almanac.showPage(item, 'item', clickButton, craftContainer);
    } else if (navButton && leftMouseButton) {
      if (navButton.classList.contains('button-next')) {
        craftContainer.querySelector('.inner.craft-1').classList.add('is--hidden');
        craftContainer.querySelector('.inner.craft-2').classList.remove('is--hidden');
      } else if (navButton.classList.contains('button-prev')) {
        craftContainer.querySelector('.inner.craft-1').classList.remove('is--hidden');
        craftContainer.querySelector('.inner.craft-2').classList.add('is--hidden');
      }
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
    let craftingOptionsTotal = 0;

    for (const recipe in craftingRecipes) {
      const itemRecipe = craftingRecipes[recipe];
      let prerequisitsFulfilled = true;
      for (const recipeItem in itemRecipe.items) {
        prerequisiteCondition: if (itemRecipe.items[recipeItem].length === 1) {
          if (Items.inventoryContains(itemRecipe.items[recipeItem][0])) {
            craftContainer
              .querySelectorAll('.nope.' + itemRecipe.items[recipeItem][0])
              .forEach(el => {
                el.classList.add('is--hidden');
              });
          } else {
            craftContainer
              .querySelectorAll('.nope.' + itemRecipe.items[recipeItem][0])
              .forEach(el => {
                el.classList.remove('is--hidden');
              });
            prerequisitsFulfilled = false;
          }
        } else {
          for (const orItem in itemRecipe.items[recipeItem]) {
            craftContainer
              .querySelectorAll('.nope.' + itemRecipe.items[recipeItem][0])
              .forEach(el => {
                el.classList.remove('is--hidden');
              });
            if (Items.inventoryContains(itemRecipe.items[recipeItem][orItem])) {
              craftContainer
                .querySelectorAll('.nope.' + itemRecipe.items[recipeItem][0])
                .forEach(el => {
                  el.classList.add('is--hidden');
                });
              break prerequisiteCondition;
            }
          }
          prerequisitsFulfilled = false;
        }
      }
      if (prerequisitsFulfilled) {
        if (itemRecipe.exclusive && Items.inventoryContains(recipe)) {
          craftContainer
            .querySelector('.button-craft[data-item="' + recipe + '"]')
            ?.classList.remove('active');
          craftContainer
            .querySelector('.button-craft[data-item="' + recipe + '"]')
            ?.classList.add('only1');
        } else {
          // small hack needed here
          if (recipe === 'rope') {
            if (Items.inventoryItemAmount('straw-wheet') === 1) {
              craftContainer.querySelector('.nope.straw-wheet')?.classList.add('is--hidden');
              craftContainer
                .querySelector('.nope.straw-wheet.additional')
                ?.classList.remove('is--hidden');
            } else {
              craftContainer.querySelector('.nope.straw-wheet')?.classList.add('is--hidden');
              craftContainer
                .querySelector('.nope.straw-wheet.additional')
                ?.classList.add('is--hidden');
              craftContainer
                .querySelector('.button-craft[data-item="' + recipe + '"]')
                ?.classList.add('active');
              craftingOptionsTotal += 1;
            }
          } else {
            craftContainer
              .querySelector('.button-craft[data-item="' + recipe + '"]')
              ?.classList.add('active');
            craftingOptionsTotal += 1;
          }
        }
      } else {
        craftContainer
          .querySelector('.button-craft[data-item="' + recipe + '"]')
          ?.classList.remove('active');
      }
    }

    if (craftingOptionsTotal !== craftingOptions.total) {
      craftingOptions.total = craftingOptionsTotal;
      this.craftingChangeFeedback();
    }
  },

  isItemPartOfCrafting: function (item) {
    for (const recipe in craftingRecipes) {
      if (
        craftingRecipes[recipe].items[0]?.includes(item) ||
        craftingRecipes[recipe].items[1]?.includes(item) ||
        craftingRecipes[recipe].items[2]?.includes(item)
      ) {
        return true;
      }
    }
    return false;
  },

  craftingChangeFeedback: function () {
    document.querySelector('#actions .craft').classList.add('transfer');
    window.setTimeout(() => {
      document.querySelector('#actions .craft').classList.remove('transfer');
    }, 400);
  },
};
