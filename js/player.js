import Binding from './binding.js'
import Props from './props.js'
import Cards from './cards.js'
import Map from './map.js'
import Battle from './battle.js'
import Ui from './ui.js'

const allPaths = Props.getAllPaths();

var player = document.getElementById("player");
var playerPosition = {};
var playerProps = {
  health: 0,
  food: 0,
  thirst: 0,
  energy: 0,
  protection: 0,
  actions: 0
};

var moveLocked = false;
var moving = false;

export default {
  
  init: function() {
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
      propMeter.parentNode.classList.remove('low');
      propMeter.parentNode.classList.remove('very-low');
      if (playerProps[prop] < 10)  {
        propMeter.parentNode.classList.add('very-low');
      } else if (playerProps[prop] < 33)  {
        propMeter.parentNode.classList.add('low');
      }
      if (prop === 'health' && change < 0) {
        document.querySelector('#properties li.health').classList.add('heavy-shake');
        window.setTimeout(() => {
          document.querySelector('#properties li.health').classList.remove('heavy-shake');
        }, 200);
      }
    }
    this.checkForDamage();
    return playerProps[prop];
  },

  previewProps: function(prop, change) {
    const previewMeter = document.querySelector('#properties li.' + prop + ' span.meter:not(.preview)');
    if (previewMeter) {
      if (change > 0) {
        playerProps[prop] + change > 100 ? change = 100 - playerProps[prop] : null;
        previewMeter.style.paddingRight = change + '%';
      } else if (change < 0) {
        if (previewMeter) {
          previewMeter.style.paddingRight = (playerProps[prop] + change > 9 ? Math.abs(change) : 0) + '%';
          previewMeter.style.width = (playerProps[prop] + change > 9 ? playerProps[prop] + change : 9) + '%';
        }
      }
      if (playerProps[prop] + change < 10)  {
        previewMeter.parentNode.classList.add('very-low');
      } else if (playerProps[prop] + change < 33)  {
        previewMeter.parentNode.classList.add('low');
      }
    }
  },

  resetPreviewProps: function() {
    document.querySelector('#properties li.food').classList.remove('transfer');
    document.querySelector('#properties li.thirst').classList.remove('transfer');
    document.querySelector('#properties li.energy').classList.remove('transfer');
    document.querySelector('#properties li.health').classList.remove('transfer');
    document.querySelector('#properties li.food span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.thirst span.meter').style.paddingRight = '0';
    document.querySelector('#properties li.energy span.meter').style.paddingRight = '0';
    this.changeProps('food', 0);
    this.changeProps('thirst', 0);
    this.changeProps('energy', 0);
    this.changeProps('health', 0);
  },

  checkForDamage: function() {
    if (this.getProp('health') < 33) {
      document.getElementById('damage-cover').style.opacity = (100 - this.getProp('health') * 3.3) / 100;
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
      startScreen.querySelector('.screen__1').classList.add('is--hidden');
      startScreen.querySelector('.screen__2').classList.add('is--hidden');
      startScreen.querySelector('.screen__3').classList.add('is--hidden');
      startScreen.querySelector('.screen__win').classList.add('is--hidden');
      startScreen.querySelector('.screen__dead').classList.remove('is--hidden');
      startScreen.style.opacity = 1;
    }, 100);
  },

  checkForWin: function() {
    let startScreen = document.getElementById('startscreen');
    startScreen.classList.remove('is--hidden');
    startScreen.style.opacity = 0;
    window.setTimeout(function() {
      startScreen.querySelector('.screen__1').classList.add('is--hidden');
      startScreen.querySelector('.screen__2').classList.add('is--hidden');
      startScreen.querySelector('.screen__3').classList.add('is--hidden');
      startScreen.querySelector('.screen__dead').classList.add('is--hidden');
      startScreen.querySelector('.screen__win').classList.remove('is--hidden');
      startScreen.style.opacity = 1;
    }, 300);
  },

  initPlayer: function() {
    Ui.showUI();
    this.changeProps('health', 0); // triggers stats bar updates
    this.changeProps('food', 0); // triggers stats bar updates
    this.changeProps('thirst', 0); // triggers stats bar updates
    this.changeProps('energy', 0); // triggers stats bar updates
    this.movePlayerTo(playerPosition.x, playerPosition.y);
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

    Ui.showUI();
    this.movePlayerTo(playerPosition.x, playerPosition.y);

    window.setTimeout(function() {
      const objectsHere = Props.getObjectsAt(playerPosition.x, playerPosition.y);
      Cards.enableActions();
      this.findAndHandleObjects();
      if (objectsHere?.some(obj => (obj.group === 'zombie' && !obj.dead))) {
        window.setTimeout(function() { Battle.startBattle(true); }.bind(this), 800);
      }
    }.bind(this), 0);

    if (!noPenalty) {
      this.changeProps('energy', -1);
      this.changeProps('thirst', -2);
      this.changeProps('food', -1);  
    }

    if (Props.getGameProp('character') === 'snackivore') {
      this.changeProps('energy', -1);
      this.changeProps('thirst', -1);
      this.changeProps('food', -1);  
    }

    if (this.getProp('food') <= 0) this.changeProps('health', -5);
    if (this.getProp('thirst') <= 0) this.changeProps('health', -5);
    if (this.getProp('energy') <= 0) this.changeProps('energy', -5);

    this.checkForDeath(true);

  },

  findAndHandleObjects: function() {
    const allFoundObjectIds = this.findObjects(playerPosition.x, playerPosition.y);
    this.handleFoundObjectIds(allFoundObjectIds);
  },

  movePlayerTo: function(x, y) {
    /* handle horizontal position */
    if (x <= 12) {
      Map.moveMapXTo(12 - x);
      player.style.left = '550px';
    } else if (x >= 29) {
      Map.moveMapXTo(29 - x);
      player.style.left = '1304px';
    } else {
      player.style.left = Math.round(x * 44.4 + 17) + 'px'; // default horizontal pos before zoom
    }
    /* handle vertical position */
    if (y < 20) {
      player.style.top = 885 - Math.round((20 - y) * 44.4) + 'px';
    } else if (y > 40) {
      player.style.top = 885 + Math.round((y - 40) * 44.4) + 'px';
    } else {
      player.style.top = '885px';
    }
    if (y < 16) {
      Ui.zoomMap(0, 1.1);
    } else {
      Ui.resetZoom();
    }
    if (playerPosition.y >= 20 && playerPosition.y <= 40) {
      Map.moveMapYTo(y);
    }
    if (x % 4 === 0 || y % 4 === 0) {
      Map.mapUncoverAt(x, y);
    }
    document.getElementById('player-hint').style.left = player.style.left;
    document.getElementById('player-hint').style.top = player.style.top;
  },

  lockMovement: function(moveable) {
    moveLocked = moveable;
  },

  initMovement: function() {
    document.body.addEventListener("keydown", this.handleKeydown.bind(this));
    document.getElementById('touchcontrols').addEventListener("pointerdown", this.handlePointerdown.bind(this));
  },

  handleKeydown: function(ev) {

    const posXBefore = playerPosition.x,
          posYBefore = playerPosition.y;

    if (!moving && !moveLocked && !Props.getGameProp('gamePaused')) {
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
        // bloody overrule sidecases caused by diagonals, else is important here!
        else if (playerPosition.x === 6 && playerPosition.y === 38) {
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

  handlePointerdown: function(ev) {
    let target = ev.target;
    let synthKey = '';

    if (target.classList.contains('up')) {
      synthKey = 'w';
    } else if (target.classList.contains('down')) {
      synthKey = 's';
    } else if (target.classList.contains('left')) {
      synthKey = 'a';
    } else if (target.classList.contains('right')) {
      synthKey = 'd';
    }

    document.body.dispatchEvent(new KeyboardEvent('keydown', {'key': synthKey}));
  },

  getPlayerPosition: function() {
    return playerPosition;
  },

  setPlayerPosition: function(x, y) {
    playerPosition.x = x;
    playerPosition.y = y;
  },

  getPlayerViewportPosition: function() {
    return {
      x: player.style.left,
      y: player.style.top
    }
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
