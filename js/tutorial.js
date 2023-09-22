import { default as Props } from './props.js'

var events = {
  '18-44': {
    title: 'Waking Up',
    text: 'You wake up on the side of the road. Behind you a destroyed city and barricades. You have to reach the ship in the North!<br><img src="./img/icons/wasd.png">'
  },
  '18-43': {
    title: 'Gather',
    text: 'There are some trees growing here. You should look around them for useful things and pick everything up. Watch your stats - hunger and thirst are a constant threat in this broken world.'
  },
  '18-40': {
    title: 'Zombies!',
    text: 'The road in front of you is blocked. Two unfortunates "survived" this accident, and now walk around as undead. They are really dangerous – better deal with them later.'
  },
  '17-40': {
    title: 'Zombie 101',
    text: 'Try to lure single Zeds towards you. Attacking them will cause other Zeds in the area join the fight. When you walk right into them, they  will attack you first.'
  },
  '30-7': {
    title: 'You found it!',
    text: 'After all the hardships you made it to the ship in time! You take your beloved in your arms and together you look over the devastated land while the ship is heading towards a hopefully safe future.',
    showAlways: true
  },
  '18-29': {
    title: 'The Horde!',
    text: 'You see a huge horde of Zombies slowly shambling across the street. At this speed it will take days before they are gone. You better turn around and search for an alternative route!',
    showAlways: true
  },
};

var specialEvents = {
  'infestation': {
    title: 'Infestation',
    text: 'The building is invested by giant rats! Scout the place before searching to avoid an immediate confrontation.<br><img src="./img/card/status-infested.png">'
  },
  'locked-building': {
    title: 'Locked Building',
    text: 'The building is locked. You need an axe to break the door.<br><img src="./img/card/status-locked.png">'
  },
  'locked-car': {
    title: 'Locked Car',
    text: 'The owners of the car left it locked. You need to smash the windows with an axe or stone to get in.<br><img src="./img/card/status-locked.png">'
  },
  'hostiles-nearby': {
    title: 'Hostiles nearby',
    text: 'You won\'t be able to enter many place until you\'ve taken care of all hostiles nearby.<br><img src="./img/card/status-zombies.png">'
  },
  'crafting': {
    title: 'Crafting',
    text: 'You collected the right resources to craft an Improvised Axe. The Axe is an extremely versatile, useful tool and weapon.<br><br><img src="./img/actions/craft.png">'
  },
  'corpse': {
    title: 'Blessing in disguise',
    text: 'Not all were rising back from the dead.<br>When chaos broke out, those few who were lucky enough not to have been infected before dying, just stayed dead.'
  },
  'rat-fight': {
    title: 'Taking a bite',
    text: 'When a rat attacks, it will steal food from your inventory to improve its defense. When there is no food left, it will attack you instead.'
  },
  'dead-animal': {
    title: 'Bon Appétit',
    text: 'Dead animals give some good meal, when being cutted into pieces and roasted over a fireplace. Just get over the disgust.<br><img src="./img/items/meat.PNG">'
  },
  'low-energy': {
    title: 'Worn-out',
    text: 'Most actions consume a certain amount of Energy. Make sure to eat high-quality food and find a place to rest or sleep. At night you get a bonus.<br><img class="double" src="./img/icons/energy.png">'
  }
};

export default {
  
  init: function() {
  },

  bind: function() {
  },

  setupAllEvents: function() {
    for (var event in events) {
      if (Props.getGameProp('tutorial') || events[event].showAlways) {
        const x = event.split('-')[0];
        const y = event.split('-')[1];
        const currentObjectsIdCounter = Props.addObjectIdAt(x, y);
        Props.setObject(currentObjectsIdCounter, {
          x: x,
          y: y,
          name: 'event',
          title: events[event].title,
          type: undefined,
          group: 'event',
          text: events[event].text,
          actions: [{
            id: 'got-it', label: 'Got it!'
          }],
          items: [],
          active: true,
          discovered: false,
          removed: false
        });  
      }
    };
  },

  setupSpecialEvent: function(event, x, y) {
    if (Props.getGameProp('tutorial')) {
      const currentObjectsIdCounter = Props.addObjectIdAt(x, y);
      Props.setObject(currentObjectsIdCounter, {
        x: x,
        y: y,
        name: 'event',
        title: specialEvents[event].title,
        type: undefined,
        group: 'event',
        text: specialEvents[event].text,
        actions: [{
          id: 'got-it', label: 'Got it!'
        }],
        items: [],
        active: true,
        discovered: false,
        removed: false
      });  
      return currentObjectsIdCounter;
    }
  }
}