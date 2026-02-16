// @ts-check

/**
 * @typedef {Object} TutorialEvent
 * @property {string} title
 * @property {string} text
 * @property {boolean} [showAlways]
 * @export
 */

/**
 * @typedef {Object} SpecialEvent
 * @property {string} title
 * @property {string} text
 * @export
 */

/**
 * @typedef {Object} TutorialDefinition
 * @property {Record<string, TutorialEvent>} events
 * @property {Record<string, SpecialEvent>} specialEvents
 * @export
 */

export default {
  events: {
    '18-44': {
      title: 'Waking Up',
      text: 'You wake up on the side of the road. Behind you a destroyed city and barricades. You have to reach the ship in the North!<br><img src="./img/icons/wasd.png">',
    },
    '18-43': {
      title: 'Gather',
      text: 'There are some trees growing here. You should look around them for useful things and pick everything up. Watch your stats - hunger and thirst are a constant threat in this broken world.',
    },
    '13-41': {
      title: 'Almanac',
      text: 'The Almanac provides details about all items.<br><img src="./img/almanac/almanac.png"><br>Just right-click item slots and crafting buttons.',
    },
    '18-40': {
      title: 'Zombies!',
      text: 'The road in front of you is blocked. Two unfortunates "survived" this accident, and now walk around as undead. They are really dangerous – better head on and deal with them later.',
    },
    '18-42-a': {
      title: 'Zombie 101',
      text: 'Try to lure Zeds towards you. Attacking them will cause others in the area join the fight. When you walk right into them, they  will attack you first.',
    },
    '18-42-b': {
      title: 'Be prepared',
      text: 'Any weapon is better than no weapon. Check your inventory. Sharp sticks, tools or stones are good – true weapons are better. Check item properties in the Almanac.',
    },
    '10-44': {
      title: 'A companion!',
      text: '<img src="./img/animals/doggy-portrait.png"><br>A small dog is bravely facing one of these monsters! He looks like he could be a little down.',
    },
    '30-7': {
      title: 'You found it!',
      text: 'After all the hardships you made it to the ship in time! You take your beloved in your arms and together you look over the devastated land while the ship is heading towards a hopefully safe future.',
      showAlways: true,
    },
    '18-29': {
      title: 'The Horde!',
      text: 'You see a huge horde of Zombies slowly shambling across the street. At this speed it will take days before they are gone. You better turn around and search for an alternative route!',
      showAlways: true,
    },
  },

  specialEvents: {
    infestation: {
      title: 'Infestation',
      text: 'The building is infested by giant rats! Scout the place before searching to avoid an immediate confrontation.<br><img src="./img/card/status-infested.png">',
    },
    'locked-building': {
      title: 'Locked',
      text: 'The content of the crate should make your tutorial run easier, but it is locked. Equip the axe to break it.<br><img src="./img/card/status-locked.png">',
    },
    'locked-car': {
      title: 'Locked Car',
      text: 'The owners of the car left it locked. You need to smash the windows with an axe or stone to get in.<br><img src="./img/card/status-locked.png">',
    },
    'hostiles-nearby': {
      title: 'Hostiles nearby',
      text: 'You won\'t be able to enter many place until you\'ve taken care of all hostiles nearby.<br><img src="./img/card/status-zombies.png">',
    },
    crafting: {
      title: 'Crafting',
      text: 'You collected the right resources to craft an Improvised Axe. The Axe is an extremely versatile, useful tool and weapon.<br><br><img src="./img/actions/craft.png">',
    },
    corpse: {
      title: 'Blessing in disguise',
      text: 'Not all were rising back from the dead.<br>When chaos broke out, those few who were lucky enough not to have been infected before dying, just stayed dead.',
    },
    'rat-fight': {
      title: 'Taking a bite',
      text: 'When a rat attacks, it will steal food from your inventory to improve its defense. When there is no food left, it will attack you instead.',
    },
    'dead-animal': {
      title: 'Bon Appétit',
      text: 'Dead animals give some good meal, when being cutted into pieces and roasted over a fireplace. Just get over the disgust.<br><img src="./img/items/meat.PNG">',
    },
    'low-energy': {
      title: 'Worn-out',
      text: 'Your energy is low.<br>Most actions consume a certain amount of Energy. Make sure to eat high-quality food and find a place to rest or sleep. Low energy gives penalties in battles.',
    },
  },
};
