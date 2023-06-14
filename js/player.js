import Binding from './binding.js'
import Props from './props.js'
import Cards from './cards.js'
import Map from './map.js'

const allPaths = Props.getAllPaths();

var player = document.getElementById("player");
var playerPosition = { x: 18, y: 44 }; //{ x: 10, y: 32 };
var playerProps = {
  health: 100,
  food: 65,
  thirst: 70,
  energy: 75,
  protection: 0,
  actions: 0
}

var moveLocked = false;
var moving = false;

export default {
  
  init() {
    this.initPlayer();
    this.initMovement();
    this.bind();
  },

  bind: function() {
    new Binding({
        object: playerProps,
        property: 'health',
        element: document.getElementById('health-meter')
    })
    new Binding({
        object: playerProps,
        property: 'food',
        element: document.getElementById('food-meter')
    })
    new Binding({
      object: playerProps,
      property: 'thirst',
      element: document.getElementById('thirst-meter')
    })
    new Binding({
      object: playerProps,
      property: 'energy',
      element: document.getElementById('energy-meter')
    })
    new Binding({
      object: playerProps,
      property: 'protection',
      element: document.getElementById('protection')
    })
    new Binding({
      object: playerProps,
      property: 'actions',
      element: document.getElementById('ap')
    })
  },

  changeProps: function(prop, change) {
    playerProps[prop] += parseInt(change);
    playerProps[prop] < 0 ? playerProps[prop] = 0 : false;
    playerProps[prop] > 100 ? playerProps[prop] = 100 : false;
    const propMeter = document.querySelector('#properties li.' + prop + ' span.meter:not(.preview)');
    if (propMeter) {
      propMeter.style.width = playerProps[prop] > 9 ? playerProps[prop] + '%' : '9%';
    }
    this.checkForDamage();
    return playerProps[prop];
  },

  previewProps: function(prop, change) {
    playerProps[prop] + change > 100 ? change = 100 - playerProps[prop] : null;
    const previewMeter = document.querySelector('#properties li.' + prop + ' span.meter:not(.preview)');
    if (previewMeter) {
      previewMeter.style.paddingRight = change + '%';
    }
  },

  checkForDamage: function() {
    let lowest = 100;
    if (this.getProp('health') < lowest) lowest = this.getProp('health');
    if (this.getProp('thirst') < lowest) lowest = this.getProp('thirst');
    if (this.getProp('food') < lowest) lowest = this.getProp('food');
    if (this.getProp('energy') < lowest) lowest = this.getProp('energy');
    if (lowest < 20) {
      document.getElementById('damage-cover').style.opacity = (100 - lowest*4) / 100;
    } else {
      document.getElementById('damage-cover').style.opacity = 0;
    }
  },

  checkForDeath: function(secondWind) {
    if (this.getProp('health') <= 0) {
      // 50:50 chance
      if (!secondWind || Math.random() >= 0.5) {
        this.playerDead();
        return true;
      }
    }
    return false;
  },

  playerDead: function() {
    let startScreen = document.getElementById('startscreen');
    startScreen.classList.remove('is--hidden');
    startScreen.style.opacity = 0;
    window.setTimeout(function() {
      startScreen.querySelector('.start').classList.add('is--hidden');
      startScreen.querySelector('.you-win').classList.add('is--hidden');
      startScreen.querySelector('.you-died').classList.remove('is--hidden');
      startScreen.style.opacity = 1;
    }, 100);
  },

  checkForWin: function() {
    let startScreen = document.getElementById('startscreen');
    startScreen.classList.remove('is--hidden');
    startScreen.style.opacity = 0;
    window.setTimeout(function() {
      startScreen.querySelector('.start').classList.add('is--hidden');
      startScreen.querySelector('.you-win').classList.remove('is--hidden');
      startScreen.querySelector('.you-died').classList.add('is--hidden');
      startScreen.style.opacity = 1;
    }, 300);
  },

  initPlayer: function() {
    this.updatePlayer();
    if (playerPosition.y < 20) {
      Map.moveMapYTo(20);
    } else if (playerPosition.y > 40) {
      Map.moveMapYTo(40);
    } else {
      Map.moveMapYTo(playerPosition.y);
    }
    Map.mapUncoverAt(playerPosition.x, playerPosition.y);
  },

  updatePlayer: function(noPenalty) {

    this.movePlayerTo(playerPosition.x, playerPosition.y);

    window.setTimeout(function() {

      Cards.enableActions();

      const allFoundObjectIds = this.findObjects(playerPosition.x, playerPosition.y);
      this.handleFoundObjectIds(allFoundObjectIds);

      // check if player walked into a zed
      // make sure zed isn't already dead
      // dead / looted zeds have to be removed from allZeds[] in the future!
      // window.setTimeout(function() { Battle.startBattle(true); }.bind(this), 800);
      
    }.bind(this), 0);

    if (!noPenalty) {
      this.changeProps('energy', -1);
      this.changeProps('thirst', -2);
      this.changeProps('food', -1);  
    }

    if (this.getProp('food') <= 0) this.changeProps('health', -5);
    if (this.getProp('thirst') <= 0) this.changeProps('health', -5);
    if (this.getProp('energy') <= 0) this.changeProps('energy', -5);

  },

  movePlayerTo: function(x, y) {
    player.style.left = Math.round(x * 44.4 + 17) + 'px';
    if (y < 20) {
      player.style.top = 885 - Math.round((20 - y) * 44.4) + 'px';
    } else if (y > 40) {
      player.style.top = 885 + Math.round((y - 40) * 44.4) + 'px';
    } else {
      player.style.top = '885px';
    }
    if (playerPosition.y >= 20 && playerPosition.y <= 40) {
      Map.moveMapYTo(y);
    }
    if (x % 4 === 0 || y % 4 === 0) {
      Map.mapUncoverAt(x, y);
    }
  },

  lockMovement: function(moveable) {
    moveLocked = moveable;
  },

  initMovement: function() {
    document.body.addEventListener("keydown", this.handleKeydown.bind(this));
  },

  handleKeydown: function(ev) {

    const posXBefore = playerPosition.x,
          posYBefore = playerPosition.y;

    if (!moving && !moveLocked) {
      if (ev.key && (ev.key.toLowerCase() === 'w' || ev.key === 'ArrowUp')) {
        ev.preventDefault();
        if (allPaths[playerPosition.x][playerPosition.y - 1]) {
          playerPosition.y -= 1;
        } else if (allPaths[playerPosition.x - 1][playerPosition.y - 1] && !allPaths[playerPosition.x - 1][playerPosition.y]) {
          playerPosition.x -= 1; playerPosition.y -= 1;
        } else if (allPaths[playerPosition.x + 1][playerPosition.y - 1] && !allPaths[playerPosition.x + 1][playerPosition.y]) {
          playerPosition.x += 1; playerPosition.y -= 1;
        }
      }
      if (ev.key && (ev.key.toLowerCase() === 's' || ev.key === 'ArrowDown')) {
        ev.preventDefault();
        if (allPaths[playerPosition.x][playerPosition.y + 1]) {
          playerPosition.y += 1;
        } else if (allPaths[playerPosition.x - 1][playerPosition.y + 1] && !allPaths[playerPosition.x - 1][playerPosition.y]) {
          playerPosition.x -= 1; playerPosition.y += 1;
        } else if (allPaths[playerPosition.x + 1][playerPosition.y + 1] && !allPaths[playerPosition.x + 1][playerPosition.y]) {
          playerPosition.x += 1; playerPosition.y += 1;
        }
      }
      if (ev.key && (ev.key.toLowerCase() === 'a' || ev.key === 'ArrowLeft')) {
        ev.preventDefault();
        if (allPaths[playerPosition.x - 1][playerPosition.y]) {
          playerPosition.x -= 1;
        } else if (allPaths[playerPosition.x - 1][playerPosition.y - 1] && !allPaths[playerPosition.x - 1][playerPosition.y]) {
          playerPosition.x -= 1; playerPosition.y -= 1;
        } else if (allPaths[playerPosition.x - 1][playerPosition.y + 1] && !allPaths[playerPosition.x + 1][playerPosition.y]) {
          playerPosition.x -= 1; playerPosition.y += 1;
        }
      }
      if (ev.key && (ev.key.toLowerCase() === 'd' || ev.key === 'ArrowRight')) {
        ev.preventDefault();
        if (allPaths[playerPosition.x + 1][playerPosition.y]) {
          playerPosition.x += 1;
        } else if (allPaths[playerPosition.x + 1][playerPosition.y - 1] && !allPaths[playerPosition.x + 1][playerPosition.y]) {
          playerPosition.x += 1; playerPosition.y -= 1;
        } else if (allPaths[playerPosition.x + 1][playerPosition.y + 1] && !allPaths[playerPosition.x + 1][playerPosition.y]) {
          playerPosition.x += 1; playerPosition.y += 1;
        }
      }
      if (posXBefore !== playerPosition.x || posYBefore !== playerPosition.y) {
        this.updatePlayer();
        moving = true;
        window.setTimeout(function() { moving = false; }, 1000);
      }  
    }
  },

  getPlayerPosition: function() {
    return playerPosition;
  },

  getProp: function(prop) {
    return playerProps[prop];
  },

  findObjects: function(x, y) {
    
    let allFoundObjectIds = [];
    x = parseInt(x);
    y = parseInt(y);

    Props.getObjectIdsAt(x, y) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x, y)) : false;
    Props.getObjectIdsAt(x, y-1) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x, y-1)) : false;
    Props.getObjectIdsAt(x+1, y-1) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x+1, y-1)) : false;
    Props.getObjectIdsAt(x+1, y) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x+1, y)) : false;
    Props.getObjectIdsAt(x+1, y+1) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x+1, y+1)) : false;
    Props.getObjectIdsAt(x, y+1) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x, y+1)) : false;
    Props.getObjectIdsAt(x-1, y+1) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x-1, y+1)) : false;
    Props.getObjectIdsAt(x-1, y) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x-1, y)) : false;
    Props.getObjectIdsAt(x-1, y-1) ? allFoundObjectIds = allFoundObjectIds.concat(Props.getObjectIdsAt(x-1, y-1)) : false;

    return allFoundObjectIds;
  },

  handleFoundObjectIds: function(allFoundObjectIds) {
    Map.showObjectIconsByIds(allFoundObjectIds);
    Cards.addObjectsByIds(allFoundObjectIds);
  }
}
