import Props from './props.js'
import Items from './items.js'
import Map from './map.js'
import Player from './player.js'


let squareX = 0, squareY = 0;
let squareFreeze = true;

export default {
  
  init: function() {
    document.body.addEventListener('click', this.handleClick.bind(this));
    this.bind();
    this.initDevConsole();
  },

  bind: function() {
  },

  handleClick: function(ev) {

    const target = ev.target;
    const leftMouseButton = (ev.button === 0);

    if (leftMouseButton) {  
      if (target.closest('#card-console')) {
        if (target.classList.contains('handle')) {
          document.getElementById('card-console').classList.toggle('out');
        } else if (target.classList.contains('select-square')) {
          squareFreeze = false;
          squareX = 0;
          squareY = 0;
          document.querySelector('#card-console .selected-square').textContent = '';
          document.getElementById('square-marker').classList.remove('freeze');
          document.getElementById('square-marker').classList.remove('is--hidden');
        } else if (target.classList.contains('place-object')) {
          if (squareX || squareY) {
            let selectedObject = document.querySelector('#card-console .select-object').value;
            if (selectedObject === 'zombie') {
              Props.setZedAt(squareX, squareY, 1);
            } else if (selectedObject === 'rats') {
              Props.spawnRatsAt(squareX, squareY);
            } else if (selectedObject === 'improvised-axe' || selectedObject === 'axe' || selectedObject === 'wooden-club' || selectedObject === 'baseball-bat' || selectedObject === 'wrench') {
              Props.setupWeapon(squareX, squareY, selectedObject);
            } else if (selectedObject === 'care-package') {
              Props.addItemToInventory('tomato', 1);
              Props.addItemToInventory('carrot', 1);
              Props.addItemToInventory('pepper', 1);
              Props.addItemToInventory('tape', 1);
              Props.addItemToInventory('drink-2', 2);
              Props.addItemToInventory('snack-1', 2);
              Props.addItemToInventory('snack-2', 2);
              Props.addItemToInventory('knife', 1);
              Props.addItemToInventory('energy-pills', 1);
              Items.inventoryChangeFeedback();
              Items.fillInventorySlots();
            } else {
              Props.setupBuilding(squareX, squareY, new Array(selectedObject));
            }
            Player.updatePlayer();
            squareFreeze = true;
            document.getElementById('square-marker').classList.remove('freeze');
            document.getElementById('square-marker').classList.add('is--hidden');
          }
        } else if (target.classList.contains('beam-character')) {
          if (squareX || squareY) {
            Player.setPlayerPosition(squareX, squareY);
            Player.updatePlayer(true);
            squareFreeze = true;
            document.getElementById('square-marker').classList.remove('freeze');
            document.getElementById('square-marker').classList.add('is--hidden');
          }
        }
      }
    }
  },

  initDevConsole: function() {
    const selectObject = document.querySelector('#card-console .select-object');
    const allBuildings = Props.getBuildingProps();
    const allWeapons = Props.getWeaponProps();

    document.getElementById('viewport').addEventListener('mousemove', this.showSquare.bind(this));
    document.getElementById('viewport').addEventListener('mousedown', this.selectSquare.bind(this));

    var opt = document.createElement('option');
    opt.value = 'care-package';
    opt.innerHTML = 'Care Package';
    selectObject.appendChild(opt);

    var opt = document.createElement('option');
    opt.value = 'zombie';
    opt.innerHTML = 'Zombie';
    selectObject.appendChild(opt);

    var opt = document.createElement('option');
    opt.value = 'rats';
    opt.innerHTML = 'Rats';
    selectObject.appendChild(opt);

    for (const weapon in allWeapons) {
      var opt = document.createElement('option');
      opt.value = weapon;
      opt.innerHTML = Items.capitalizeFirstLetter(weapon.replaceAll('-', ' '));
      selectObject.appendChild(opt);
    }

    for (const building in allBuildings) {
      var opt = document.createElement('option');
      opt.value = building;
      opt.innerHTML = Items.capitalizeFirstLetter(building.replaceAll('-', ' '));
      selectObject.appendChild(opt);
    }
  },

  showSquare: function(ev) {
    const viewportRect = document.getElementById('viewport').getBoundingClientRect();
    const playerPosition = Player.getPlayerPosition();
    let mouseX, mouseY;

    if (!squareFreeze) {
      mouseX = Math.floor(((ev.clientX - viewportRect.left) / Props.getGameProp('scaleFactor')) / 44.4);
      mouseY = Math.floor(((ev.clientY - 23 - viewportRect.top) / Props.getGameProp('scaleFactor')) / 44.4);

      squareX = mouseX;
      if (playerPosition.y < 20) {
        squareY = mouseY;
      } else if (playerPosition.y > 40) {
        squareY = mouseY + 21;
      } else {
        squareY = mouseY + (21 - (40 - playerPosition.y));
      }
      document.querySelector('#card-console .selected-square').textContent = '('+squareX+', '+squareY+')';
      document.getElementById('square-marker').style.left = (mouseX * 44.4) + 'px';
      document.getElementById('square-marker').style.top = (mouseY * 44.4 + 23) + 'px';
      Map.mapUncoverAt(squareX, squareY);
    }
  },

  selectSquare: function(ev) {
    if (squareX || squareY) {
      squareFreeze = true;
      document.getElementById('square-marker').classList.add('freeze');
    }
  }
}