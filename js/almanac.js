import Props from './props.js';
import Items from './items.js';
import ItemUtils from '../data/utils/item-utils.js';
import RecipeDefinitions from '../data/definitions/recipe-definitions.js';

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

const almanacContent = {
  battle: {
    motive: './img/almanac/battle.png',
    markup:
      '<p>Once a battle starts, all your inventory items turn into a Battle Card deck.</p><p>Each item now has orange Damage and blue Protection values.</p><p>Make sure you have enough items at hand before starting a fight.</p>',
  },
  health: {
    motive: './img/almanac/health.png',
    markup:
      '<p>Your character is loosing health not only in <span class="keyword" data-content="battle">battle</span>, but also when <span class="keyword" data-content="food">starving</span> or when suffering from <span class="keyword" data-content="thirst">thirst</span>.</p><p>Health is restored during resting or most efficiently when taking a sleep.</p>',
  },
  food: {
    motive: './img/almanac/food.png',
    markup:
      '<p>Hunger and starvation are a constant threat. Gather around trees or search vehicles and buildings for all sorts of food. Cut dead animals to get their <span class="keyword" data-item="meat">meat</span>.</p><p>When ever you can, cook raw food at a <span class="keyword" data-content="fireplace">fireplace</span> to get high-quality meals.</p>',
  },
  thirst: {
    motive: './img/almanac/drink.png',
    markup:
      '<p>Search vehicles and buildings to find <span class="keyword" data-item="drink-1">Water Bottles</span> and <span class="keyword" data-item="drink-3">Soda Cans</span>.</p><p>If you find a Jetty, Pump or Well, these are all jackpots. They allow you to drink as much as you like.</p>',
  },
  energy: {
    motive: './img/almanac/energy.png',
    markup:
      '<p>Most actions will consume some of your energy. It is important to renew your energy through regular rest and sleep - night time will give you a bonus.</p><p>Some <span class="keyword" data-content="food">food</span> and <span class="keyword" data-item="energy-pills">pills</span> will also provide energy, cooked meals are true power packs.</p>',
  },
  fireplace: {
    motive: './img/almanac/fireplace.png',
    markup:
      '<p>Raw food roasted with a <span class="keyword" data-item="sharp-stick">sharp stick</span> over fire provides substantially more <span class="keyword" data-content="food">nutritions</span> and <span class="keyword" data-content="energy">energy</span>.</p><p>A <span class="keyword" data-content="fireplace">fireplace</span> can be crafted from <span class="keyword" data-item="stone">stone</span>, <span class="keyword" data-item="stump">stump</span> and <span class="keyword" data-item="straw-wheet">straw wheet</span>.</p><p>It remains in place where it is crafted.</p>',
  },
  axe: {
    motive: './img/weapons/axe.png',
    markup:
      '<p>A rare weapon and stronger version of the <span class="keyword" data-item="improvised-axe">Improvised Axe</span></p><p>This weapon can\'t be crafted but can only be found in basements.</p>',
  },
  'baseball-bat': {
    motive: './img/weapons/baseball-bat.png',
    markup:
      '<p>A rare weapon and stronger version of the <span class="keyword" data-item="wooden-club">Wooden Club</span></p><p>This weapon can\'t be crafted but can only be found in basements and on human corpses.</p>',
  },
  wrench: {
    motive: './img/weapons/wrench.png',
    markup:
      "<p>A rare weapon that can't be crafted but can only be found in tool sheds and garages.</p>",
  },
  'improvised-whip': {
    motive: './img/weapons/improvised-whip.png',
    markup:
      '<p>A weapon with rather little damage. However, when targeting a certain enemy, it will also hit all adjacent enemies.</p>',
  },
  'fishing-rod': {
    motive: './img/weapons/fishing-rod.png',
    markup:
      '<p>With a fishing rod equiped, players can use the additional action "Fish" on the Jetty.</p>',
  },
  barricades: {
    motive: './img/almanac/barricades.png',
    markup:
      '<p>Barricades offer a strategic option for preparing <span class="keyword" data-content="battle">battles</span> against larger numbers of zombies.</p><p>Built in the direct surrounding of a battle, they offer a decent amount of protection as well as dealing some passive damage to attacking enemies.</p><p>Similar to <span class="keyword" data-content="fireplace">fireplaces</span>, barricades remain in place where they are crafted.</p>',
  },
  doggy: {
    motive: './img/animals/doggy.png',
    markup:
      '<p>Unlocks the "Chomp!" command which lets your furry friend rush into <span class="keyword" data-content="battle">battles</span> against enemies.</p><p>Your companions will take damage in battles, which can be healed by feeding them <span class="keyword" data-content="food">food</span>.</p>',
  },
  everyman: {
    motive: './img/characters/hero.png',
    markup: document.querySelector('div[data-character="everyman"]').innerHTML,
  },
  treehugger: {
    motive: './img/characters/hero.png',
    markup: document.querySelector('div[data-character="treehugger"]').innerHTML,
  },
  snackivore: {
    motive: './img/characters/hero.png',
    markup: document.querySelector('div[data-character="snackivore"]').innerHTML,
  },
  craftsmaniac: {
    motive: './img/characters/hero.png',
    markup: document.querySelector('div[data-character="craftsmaniac"]').innerHTML,
  },
};

export default {
  init: function () {
    almanacContainer.addEventListener('mousedown', this.checkActionClick.bind(this));
    almanacContainer.dataset.item = '';
  },

  close: function (force) {
    if (force || !almanacContainer.classList.contains('repos')) {
      almanacContainer.classList.remove('repos');
      almanacContainer.classList.add('out');
      almanacContainer.dataset.item = '';
      almanacContainer.removeAttribute('style');
    }
  },

  checkActionClick: function (ev) {
    const target = ev.target;
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
        this.showPage(prevPage[0], prevPage[1]);
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

  showPage: function (item, type, refElem, parentElem) {
    if (item.endsWith('-1-2')) {
      item = item.replace('-2', '');
    }
    if (almanacContainer.dataset?.item !== item) {
      almanacContainer.dataset.item = item;

      if (refElem && parentElem && !almanacContainer.classList.contains('repos')) {
        const left =
          refElem.offsetLeft + parentElem.offsetLeft > 120
            ? refElem.offsetLeft + parentElem.offsetLeft
            : 120;
        const top =
          refElem.offsetTop + parentElem.offsetTop > 445
            ? refElem.offsetTop + parentElem.offsetTop
            : 445;
        almanacContainer.style.left = left + 'px';
        almanacContainer.style.top = top + 'px';
      }

      almanacContainer.querySelector('img.motive').classList.remove('unknown');
      markupSection.classList.add('is--hidden');
      contentParagraph.classList.add('is--hidden');
      statsParagraph.classList.add('is--hidden');
      almanacContainer.classList.remove('out');
      cookingParagraph.classList.add('is--hidden');
      craftingParagraph.classList.add('is--hidden');
      battlesParagraph.classList.add('is--hidden');
      weaponUpgradeParagraph.classList.add('is--hidden');

      if ((item === 'fireplace' || item === 'barricades') && type === 'item') {
        type = 'content'; // todo: better solution needed
      }

      // set title
      almanacContainer.querySelector('h3').textContent = ItemUtils.extractItemName(item);
      if (type === 'item') {
        const itemProps = Props.calcItemProps(item);
        if (Items.inventoryKnows(item)) {
          // update motive img
          if (itemProps.type !== 'extra') {
            almanacContainer
              .querySelector('img.motive')
              .setAttribute('src', './img/items/' + item + '.PNG');
          } else {
            almanacContainer
              .querySelector('img.motive')
              .setAttribute('src', './img/weapons/' + item + '.png');
          }
          // stats
          if (itemProps) {
            if (itemProps.food || itemProps.drink || itemProps.energy) {
              let itemMods = ItemUtils.getItemModifier(Props.getGameProp('character'), item);
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
          // update motive img
          if (itemProps.type !== 'extra') {
            almanacContainer
              .querySelector('img.motive')
              .setAttribute('src', './img/items/' + item + '.PNG');
          } else {
            almanacContainer
              .querySelector('img.motive')
              .setAttribute('src', './img/weapons/' + item + '.png');
          }
          almanacContainer.querySelector('img.motive').classList.add('unknown');
          contentParagraph.innerHTML = "You haven't discovered this item yet.";
          contentParagraph.classList.remove('is--hidden');
        }
      }
      if (type === 'content') {
        if (almanacContent[item] !== undefined) {
          almanacContainer
            .querySelector('img.motive')
            .setAttribute('src', almanacContent[item].motive);
          markupSection.innerHTML = almanacContent[item].markup;
          markupSection.classList.remove('is--hidden');

          if (markupSection.offsetHeight > 200) {
            almanacContainer.style.top =
              parseInt(almanacContainer.style.top, 10) + markupSection.offsetHeight - 200 + 'px';
          }
        }
      }
      if (!almanacHistory.length || almanacHistory.at(-1)[0] !== item) {
        almanacHistory.push([item, type]);
        this.updateNavigation();
      }
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
