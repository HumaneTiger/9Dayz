import Props from './props.js';
import { ItemUtils, RecipeDefinitions } from '../data/index.js';
import { EventManager, EVENTS, CharacterManager } from './core/index.js';
import AlmanacContent from './content/almanac-content.js';

const almanacContainer = document.getElementById('almanac');
const markupSection = almanacContainer.querySelector('div.markup');
const contentParagraph = almanacContainer.querySelector('p.content');
const statsParagraph = almanacContainer.querySelector('p.stats');
const cookingParagraph = almanacContainer.querySelector('p.cooking');
const craftingParagraph = almanacContainer.querySelector('p.crafting');
const battlesParagraph = almanacContainer.querySelector('p.battles');
const weaponUpgradeParagraph = almanacContainer.querySelector('p.weapon-upgrades');
const craftingRecipes = RecipeDefinitions.craftingRecipes;
const cookingRecipes = RecipeDefinitions.cookingRecipes;

let almanacHistory = [];

export default {
  init: function () {
    almanacContainer.addEventListener('mousedown', this.handleAlmanacAction.bind(this));
    document.body.addEventListener('mousedown', this.handleAlmanacOpenPage.bind(this));
    // EVENT: React to first item of a kind being added to inventory to make it known in almanac
    EventManager.on(EVENTS.FIRST_ITEM_ADDED, ({ item }) => {
      this.makeContentKnown(item);
      this.updatePage();
    });
  },

  close: function (force) {
    if (force || !almanacContainer.classList.contains('repos')) {
      almanacContainer.classList.remove('repos');
      almanacContainer.classList.add('out');
      almanacContainer.dataset.item = '';
      almanacContainer.removeAttribute('style');
    }
  },

  /* handles all triggers which open almanac pages via right-click */
  handleAlmanacOpenPage: function (ev) {
    const target = ev.target;
    const rightMouseButton = ev.button === 2;

    if (!rightMouseButton) {
      return;
    }

    // click on item inventory slots
    const inventoryContainer = target.closest('#inventory');
    const inventoryItemSlot = target.closest('.slot');
    if (inventoryContainer && inventoryItemSlot) {
      if (
        inventoryItemSlot.classList.contains('active') ||
        inventoryItemSlot.classList.contains('inactive')
      ) {
        const item = inventoryItemSlot.dataset.item;
        this.showPage(item, inventoryItemSlot, inventoryContainer);
      }
      return;
    }

    // ui property pages
    const clickProperty = target.closest('#properties');
    if (clickProperty) {
      const property = target.closest('li');
      if (property?.classList.contains('health')) {
        this.showPage('health', property, document.getElementById('properties'));
      } else if (property?.classList.contains('food')) {
        this.showPage('food', property, document.getElementById('properties'));
      } else if (property?.classList.contains('thirst')) {
        this.showPage('thirst', property, document.getElementById('properties'));
      } else if (property?.classList.contains('energy')) {
        this.showPage('energy', property, document.getElementById('properties'));
      }
      return;
    }

    // character pages
    // equipped weapon pages
    const characterContainer = target.closest('#character');
    const characterSlotContainer = target.closest('.card');
    if (characterContainer && characterSlotContainer) {
      if (characterSlotContainer.dataset.item) {
        this.showPage(
          characterSlotContainer.dataset.item,
          characterSlotContainer,
          characterContainer
        );
      } else if (characterSlotContainer.classList.contains('slot-hero')) {
        this.showPage(Props.getGameProp('character'), characterSlotContainer, characterContainer);
      }
      return;
    }

    // card loot item slot pages
    const cardContainer = target.closest('.card');
    const itemContainer = target.closest('li.item:not(.is--hidden)');
    if (cardContainer && itemContainer) {
      const itemName = itemContainer.dataset.item;
      this.makeContentKnown(itemName);
      this.showPage(itemName, itemContainer.closest('ul.items'), cardContainer);
      return;
    }

    // cooking ingredient slot pages
    const cookingContainer = target.closest('.card.cooking-mode');
    const cookingItemSlot = target.closest('.slot');
    if (cookingContainer && cookingItemSlot) {
      if (
        cookingItemSlot.classList.contains('active') ||
        cookingItemSlot.classList.contains('inactive')
      ) {
        const item = cookingItemSlot.dataset?.item;
        if (item !== undefined) {
          this.makeContentKnown(item);
          this.showPage(item, cookingItemSlot, cookingContainer);
        }
      }
      return;
    }

    // crafting action button pages
    const craftContainer = target.closest('#craft');
    const craftingActionButton = target.closest('.button-craft');
    if (craftContainer && craftingActionButton) {
      const item = craftingActionButton.dataset.item;
      this.showPage(item, craftingActionButton, craftContainer);
    }
  },

  /* handles all action button clicks inside the almanac */
  handleAlmanacAction: function (ev) {
    const target = ev.target;
    const leftMouseButton = ev.button === 0;

    if (!(leftMouseButton && target.closest(`#${almanacContainer.id}`))) {
      return;
    }

    const itemReference = target.closest('span.keyword');
    const backButton = target.closest('.back-button');
    const closeButton = target.closest('.close-button');

    if (closeButton) {
      this.close(true);
    }

    if (backButton) {
      if (almanacHistory.length > 1) {
        almanacHistory.pop(); // last element is current item
        const prevPage = almanacHistory.pop();
        this.showPage(prevPage[0]);
      }
      this.updateNavigation();
    }

    if (itemReference) {
      if (itemReference.dataset?.item) {
        this.showPage(itemReference.dataset?.item, 'item');
      } else if (itemReference.dataset?.content) {
        this.showPage(itemReference.dataset?.content, 'content');
      }
    }
  },

  makeContentKnown: function (content) {
    if (!AlmanacContent.knownContent.includes(content)) {
      AlmanacContent.knownContent.push(content);
    }
  },

  isContentKnown: function (content) {
    return AlmanacContent.knownContent.includes(content);
  },

  renderItemPageContent: function (item) {
    const itemProps = Props.calcItemProps(item);
    // update motive image for both types
    const imgSubPath = !Props.isWeapon(item) ? 'items' : 'weapons';
    const imgExtension = !Props.isWeapon(item) ? 'PNG' : 'png';
    almanacContainer
      .querySelector('img.motive')
      .setAttribute('src', `./img/${imgSubPath}/${item}.${imgExtension}`);

    if (this.isContentKnown(item)) {
      // stats
      if (itemProps) {
        if (itemProps.food || itemProps.drink || itemProps.energy) {
          let itemMods = CharacterManager.getItemModifier(Props.getGameProp('character'), item);
          let itemFood = itemProps.food,
            itemDrink = itemProps.drink,
            itemEnergy = itemProps.energy || 0;
          if (itemMods !== undefined && itemMods[0] !== 0) {
            itemFood +=
              '<small>(' + (itemMods[0] > 0 ? '+' + itemMods[0] : itemMods[0]) + ')</small>';
          }
          if (itemMods !== undefined && itemMods[1] !== 0) {
            itemDrink +=
              '<small>(' + (itemMods[1] > 0 ? '+' + itemMods[1] : itemMods[1]) + ')</small>';
          }
          if (itemMods !== undefined && itemMods[2] !== 0) {
            itemEnergy +=
              '<small>(' + (itemMods[2] > 0 ? '+' + itemMods[2] : itemMods[2]) + ')</small>';
          }
          let propsText =
            'This item satisfies <span class="keyword" data-content="food">' +
            itemFood +
            ' Hunger</span> and <span class="keyword" data-content="thirst">' +
            itemDrink +
            ' Thirst</span>.';
          if (itemProps.energy) {
            propsText =
              propsText +
              ' It provides <span class="keyword" data-content="energy">' +
              itemEnergy +
              ' Energy</span>.';
          }
          statsParagraph.innerHTML = propsText;
          statsParagraph.classList.remove('is--hidden');
        }
        if (itemProps.damage !== undefined && itemProps.protection !== undefined) {
          let battleText = `In Battles <span class="keyword" data-item="${item}">${ItemUtils.extractItemName(item)}</span> deals <span class="keyword" data-content="battle">${itemProps.damage} Damage</span> and offers <span class="keyword" data-content="battle">${itemProps.protection} Protection</span>.`;
          battlesParagraph.innerHTML = battleText;
          battlesParagraph.classList.remove('is--hidden');
        }
      }
      // check if cooking recipe
      for (const recipe in cookingRecipes) {
        if (
          recipe === item ||
          cookingRecipes[recipe][0] === item ||
          cookingRecipes[recipe][1] === item
        ) {
          let cookingText =
            `<span class="keyword" data-item="${recipe}">${ItemUtils.extractItemName(recipe)}</span> can be ${cookingRecipes[recipe][3]}ed over <span class="keyword" data-content="fireplace">fire</span> with ` +
            `<span class="keyword" data-item="${cookingRecipes[recipe][0]}">${ItemUtils.extractItemName(cookingRecipes[recipe][0])}</span> and ` +
            `<span class="keyword" data-item="${cookingRecipes[recipe][1]}">${ItemUtils.extractItemName(cookingRecipes[recipe][1])}</span>.`;
          cookingParagraph.innerHTML = cookingText;
          cookingParagraph.classList.remove('is--hidden');
        }
      }
      // check if crafting recipe
      for (const recipe in craftingRecipes) {
        if (recipe === item || craftingRecipes[recipe].items.flat().includes(item)) {
          let craftingText = `<span class="keyword" data-item="${recipe}">${ItemUtils.extractItemName(recipe)}</span> can be crafted from `;
          for (const [i, recipeItem] of craftingRecipes[recipe].items.entries()) {
            craftingText =
              craftingText +
              `<span class="keyword" data-item="${recipeItem[0]}">${ItemUtils.extractItemName(recipeItem[0])}</span>`;
            if (recipeItem[1] !== undefined) {
              craftingText =
                craftingText +
                ` or <span class="keyword" data-item="${recipeItem[1]}">${ItemUtils.extractItemName(recipeItem[1])}</span>`;
            }
            if (i < craftingRecipes[recipe].items.length - 1) {
              craftingText += ' and ';
            } else {
              craftingText += '.';
            }
          }
          craftingParagraph.innerHTML = craftingText;
          craftingParagraph.classList.remove('is--hidden');
        }
      }
      // check if weapon upgrade
      const weaponPropsUpgrades = Props.getWeaponPropsUpgrades();
      let weaponUpgradeText;
      for (const weaponUpgrade in weaponPropsUpgrades) {
        if (
          weaponPropsUpgrades[weaponUpgrade].attack?.item === item ||
          weaponPropsUpgrades[weaponUpgrade].defense?.item === item ||
          weaponPropsUpgrades[weaponUpgrade].durability?.item === item
        ) {
          if (!weaponUpgradeText) weaponUpgradeText = `Can be used to improve`;
          weaponUpgradeText += ` <span class="keyword" data-item="${weaponUpgrade}">${ItemUtils.extractItemName(weaponUpgrade)}</span>,`;
        }
      }
      if (weaponUpgradeText) {
        weaponUpgradeParagraph.innerHTML = weaponUpgradeText.replace(/.$/, '.');
        weaponUpgradeParagraph.classList.remove('is--hidden');
      }
    } else {
      almanacContainer.querySelector('img.motive').classList.add('unknown');
      contentParagraph.innerHTML = "You haven't discovered this item yet.";
      contentParagraph.classList.remove('is--hidden');
    }
  },

  renderContentPageContent: function (item) {
    if (this.isContentKnown(item)) {
      almanacContainer
        .querySelector('img.motive')
        .setAttribute('src', AlmanacContent.contentPages[item].motive);
      markupSection.innerHTML = AlmanacContent.contentPages[item].markup;
      markupSection.classList.remove('is--hidden');

      if (markupSection.offsetHeight > 200) {
        almanacContainer.style.top =
          parseInt(almanacContainer.style.top, 10) + markupSection.offsetHeight - 200 + 'px';
      }
    } else {
      almanacContainer
        .querySelector('img.motive')
        .setAttribute('src', AlmanacContent.contentPages[item].motive);
      almanacContainer.querySelector('img.motive').classList.add('unknown');
      contentParagraph.innerHTML = "You haven't discovered this item yet.";
      contentParagraph.classList.remove('is--hidden');
    }
  },

  positionAlmanacContainer: function (refElem, parentElem) {
    // adjust position if almanac wasn't repositioned
    if (refElem && parentElem && !almanacContainer.classList.contains('repos')) {
      const left =
        refElem.offsetLeft + parentElem.offsetLeft > 120
          ? refElem.offsetLeft + parentElem.offsetLeft
          : 120;
      const top =
        refElem.offsetTop + parentElem.offsetTop > 550
          ? refElem.offsetTop + parentElem.offsetTop
          : 550;
      almanacContainer.style.left = left + 'px';
      almanacContainer.style.top = top + 'px';
    }
  },

  resetAlmanacPageContent: function () {
    almanacContainer.querySelector('img.motive').classList.remove('unknown');
    markupSection.classList.add('is--hidden');
    contentParagraph.classList.add('is--hidden');
    statsParagraph.classList.add('is--hidden');
    almanacContainer.classList.remove('out');
    cookingParagraph.classList.add('is--hidden');
    craftingParagraph.classList.add('is--hidden');
    battlesParagraph.classList.add('is--hidden');
    weaponUpgradeParagraph.classList.add('is--hidden');
  },

  showPage: function (item, refElem, parentElem) {
    if (almanacContainer.dataset?.item !== item) {
      almanacContainer.dataset.item = item;

      this.positionAlmanacContainer(refElem, parentElem);
      this.updatePage();

      if (!almanacHistory.length || almanacHistory.at(-1)[0] !== item) {
        almanacHistory.push([item]);
        this.updateNavigation();
      }
    }
  },

  updatePage: function () {
    const item = almanacContainer.dataset.item;
    if (!item) {
      return;
    }
    // set title text
    almanacContainer.querySelector('h3').textContent = ItemUtils.extractItemName(item);
    this.resetAlmanacPageContent();
    if (AlmanacContent.contentPages[item] === undefined) {
      this.renderItemPageContent(item);
    } else {
      this.renderContentPageContent(item);
    }
  },

  updateNavigation: function () {
    if (almanacHistory.length > 1) {
      almanacContainer.querySelector('.back-button').classList.remove('is--hidden');
    } else {
      almanacContainer.querySelector('.back-button').classList.add('is--hidden');
    }
  },
};
