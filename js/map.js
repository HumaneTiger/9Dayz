import Props from './props.js'

const allQuadrants = Props.getAllQuadrants();

const buidingsContainer = document.querySelector('.map .map-buildings');
const highlightsContainer = document.querySelector('.map .map-highlights');
const allBuildings = Props.getAllBuildings();
const allPaths = Props.getAllPaths();
const allZeds = Props.getAllZeds();

const map = document.querySelector('#maximap .map');
const mapCover = map.querySelector('.map-cover .cover');
// deactivate this fow feature, as it causes hefty performance issues
// will try to solve the non-interactive map parts with canvas later
const isChromium = true; // window.chrome;

var uncoverMatrix = new Array(15);
for (var i = 0; i < uncoverMatrix.length; i += 1) { uncoverMatrix[i] = new Array(30); }

export default {
  
  init() {
    // fix missing mask implementation in chrome
    if (isChromium) {
      mapCover.style.background = 'initial';
    }
  },

  placeBuildingsAt: function(x, y) {
    if (allQuadrants[x][y] !== undefined) {
      if (allBuildings[x][y] === undefined) {
        buidingsContainer.innerHTML += "<span class='building-icon at-" + x + "-" + y + "' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'><img src='./img/icons/buildings/" + Props.getBuildingTypeOf(allQuadrants[x][y][0]) + ".png'></span>";
        allBuildings[x][y] = allQuadrants[x][y];
      }
    }
  },

  showObjectIconsByIds: function(objectIds) {
    objectIds?.forEach(objectId => {
      let object = Props.getObject(objectId);
      const x = object.x,
            y = object.y,
            type = object.type;
    
      if (type !== undefined && !object.discovered) {
        buidingsContainer.innerHTML += "<span class='building-icon at-" + x + "-" + y + "' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" +
                                      "<img src='./img/icons/buildings/" + type + ".png'></span>";  
      }
    });
  },

  placeZedsAt: function(x, y) {
    if (allZeds[x][y] === 1 || allZeds[x][y] === 2 || allZeds[x][y] === 3) {
      highlightsContainer.innerHTML += "<span class='zed-area at-" + x + "-" + y + "' style='top: " + Math.round(y * 44.4 + 8) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>";
      buidingsContainer.innerHTML += "<span class='zed-icon at-" + x + "-" + y + "' style='top: " + Math.round(y * 44.4 + 8) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'><img src='./img/icons/buildings/zombie.png'></span>";
    }
  },

  removeZedsAt: function(x, y) {
    let highlight = highlightsContainer.querySelector('span.zed-area.at-' + x + '-' + y);
    let buiding = buidingsContainer.querySelector('span.zed-icon.at-' + x + '-' + y);
    if (highlight !== null) {
      highlight.remove();
    }
    if (buiding !== null) {
      buiding.remove();
    }
  },

  removeBuildingsAt: function(x, y) {
    let buiding = buidingsContainer.querySelector('span.building-icon.at-' + x + '-' + y);
    if (buiding !== null) {
      buiding.remove();
    }
  },

  getBuildingsAt: function(x, y) {
    return allBuildings[x][y];
  },

  numberQuadrants: function() {
    window.setTimeout(function() {
      var quadrantContainer = document.querySelector('#maximap .inner .map-quadrant');
      for (var x = 0; x < allQuadrants.length; x += 1) {
        for (var y = 0; y < allQuadrants[x].length; y += 1) {
          if (allZeds[x][y] !== undefined) {
            quadrantContainer.innerHTML += "<span class='quadrant i-zed' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" + allZeds[x][y] + " Zed</span>";
          } else if (allQuadrants[x][y] !== undefined || allPaths[x][y] !== undefined) {
            if (allQuadrants[x][y] !== undefined) {
              quadrantContainer.innerHTML += "<span class='quadrant i-building' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" + allQuadrants[x][y][0] + "<br>+" + (allQuadrants[x][y].length - 1) + "</span>";
            } else {
              quadrantContainer.innerHTML += "<span class='quadrant i-path' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>PA<br>TH</span>";
            }
          } else {
            quadrantContainer.innerHTML += "<span class='quadrant' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" + x + ",<br>" + y + "</span>";
          }
        }
      }
    }, 800);
  },

  moveMapYTo: function(y) {
    const refVert = 885, refPosY = 33;
    let shiftY = (refPosY - y) * 44.4;
    map.style.transform = 'translate3d(0, ' + shiftY + 'px, 0)';
  },

  showTargetLocation: function(target) {
    let targetLocations = Props.getAllTargetLocations();
    if (targetLocations[target]) {
      let x = targetLocations[target][0];
      let y = targetLocations[target][1];
      mapCover.innerHTML += "<span class='location' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" + target + "</span>";      
    }
  },

  mapUncoverAt: function(x, y) {

    const uncoverX = Math.floor(x / 4);
    const uncoverY = Math.floor(y / 4);
    var mask = '';

    // solution for chrome? https://blog.logrocket.com/css-mask-image-property/
    if (!isChromium && mapCover && uncoverMatrix[uncoverX][uncoverY] === undefined) {
      uncoverMatrix[uncoverX][uncoverY] = true;
      // create new Mask
      for (var i = 0; i < uncoverMatrix.length; i += 1) {
        for (var j = 0; j < uncoverMatrix[i].length; j += 1) {
          if (uncoverMatrix[i][j] === true) {
            mask += 'radial-gradient(at ' + (i * 44.4 * 4 ) + 'px ' + (j * 44.4 * 4 ) + 'px ' + ', transparent 4%, black 12%, black),';
          }
        }
      }
      if (mask !== '') {
        mask = mask.slice(0, -1); // remove last comma
        mapCover.style.mask = mask;
        mapCover.style.webkitMask = mask;
        mapCover.style.maskComposite = 'intersect';
        mapCover.style.webkitMaskComposite = 'intersect';
      }
    }
  }
}
