export default {
  knownContent: [
    'battle',
    'health',
    'food',
    'thirst',
    'energy',
    'everyman',
    'treehugger',
    'snackivore',
    'craftsmaniac',
    'furbuddy',
  ],
  contentPages: {
    water: {
      motive: './img/items/water.PNG',
      markup:
        '<p>Bottled water is needed in some cooking and crafting recipes as well as to quench your <span class="keyword" data-content="thirst">thirst</span>.</p>',
    },
    mushrooms: {
      motive: './img/items/mushrooms.png',
      markup:
        '<p>Mushrooms can be found under trees and in open fields. They can be <span class="keyword" data-item="roasted-mushroom">roasted</span> over a <span class="keyword" data-content="fireplace">fireplace</span> or can be eaten raw.</p>',
    },
    fruits: {
      motive: './img/items/fruits.png',
      markup:
        '<p>Fruits can be found under trees. They can be used at the <span class="keyword" data-content="fireplace">fireplace</span> for certain recipes or can be eaten raw.</p>',
    },
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
        '<p>A weapon with rather little damage. However, when targeting a certain enemy, it will also hit all adjacent enemies.</p><p>Ideal when facing multiple weaker enemies.</p>',
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
        '<p>Unlocks the "Chomp!" command which lets your furry friend rush into <span class="keyword" data-content="battle">battles</span> against enemies.</p><p>Your companions will take damage in battles, which can be healed by feeding them <span class="keyword" data-content="food">food</span>.</p>' +
        '<p>Doggy attacks first when fighting zombies, but is attacked first by smaller creatures.</p>',
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
    furbuddy: {
      motive: './img/characters/hero.png',
      markup: document.querySelector('div[data-character="furbuddy"]').innerHTML,
    },
  },
};
