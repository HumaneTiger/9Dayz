import Props from './props.js'
import Items from './items.js'

const almanacContainer = document.getElementById('almanac');
const cookingParagraph = almanacContainer.querySelector('p.cooking');
const craftingParagraph = almanacContainer.querySelector('p.crafting');
const battlesParagraph = almanacContainer.querySelector('p.battles');
const craftingRecipes = Props.getCraftingRecipes();
const cookingRecipes = Props.getCookingRecipes();

export default {
  
  init: function() {
    almanacContainer.addEventListener('mousedown', this.checkActionClick.bind(this));
  },

  checkActionClick: function(ev) {

    const target = ev.target;
    const clickButton = target.closest('.button');

    if (clickButton) {

    }
  },

  showPage: function(item, type) {

    almanacContainer.classList.remove('out');
    cookingParagraph.classList.add('is--hidden');
    craftingParagraph.classList.add('is--hidden');
    battlesParagraph.classList.add('is--hidden');

    if (type === 'item') {
      // set title
      almanacContainer.querySelector('h3').textContent = this.extractItemName(item);
      // update motive img
      almanacContainer.querySelector('img.motive').setAttribute('src', './img/items/' + item + '.PNG');
      // check if cooking recipe
      for (const recipe in cookingRecipes) {
        if (recipe === item || cookingRecipes[recipe][0] === item || cookingRecipes[recipe][1] === item ) {
          let cookingText = '<span class="keyword">' + this.extractItemName(recipe) + '</span>' + ' can be ' + cookingRecipes[recipe][3] + 'ed with ' +
                             '<span class="keyword">' + this.extractItemName(cookingRecipes[recipe][0]) + '</span> and ' +
                             '<span class="keyword">' + this.extractItemName(cookingRecipes[recipe][1]) + '</span>.'
          cookingParagraph.innerHTML = cookingText;
          cookingParagraph.classList.remove('is--hidden');
        }
      }
      // check if crafting recipe
      for (const recipe in craftingRecipes) {
        if (recipe === item) {
          let craftingText = '<span class="keyword">' + this.extractItemName(recipe) + '</span>' + ' can be crafted from ';
          for (const [i, recipeItem] of craftingRecipes[recipe].items.entries()) {
            craftingText = craftingText + '<span class="keyword">' + this.extractItemName(recipeItem[0]) + '</span>';
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
      // battle stats
      if (Props.calcItemDamage(item) !== undefined && Props.calcItemDamage(item) !== undefined) {
        let battleText = 'In Battles this item deals <span class="keyword">' + Props.calcItemDamage(item) + ' Damage</span> and offers <span class="keyword">' + Props.calcItemDamage(item) + ' Protection</span>.';
        battlesParagraph.innerHTML = battleText;
        battlesParagraph.classList.remove('is--hidden');    
      }
    }
  },

  extractItemName: function(item) {
    return item.replace('-', ' ').replace(' 1-2', '').replace(' 1', '').replace(' 2', '');
  }
}