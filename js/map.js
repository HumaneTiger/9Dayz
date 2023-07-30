import Props from './props.js'

const buidingsContainer = document.querySelector('.map .map-buildings');
const highlightsContainer = document.querySelector('.map .map-highlights');

const map = document.querySelector('#maximap .map');
const mapCover = map.querySelector('.map-cover .cover');
// deactivate this fow feature, as it causes hefty performance issues
// will try to solve the non-interactive map parts with canvas later
const isChromium = true; // window.chrome;

var uncoverMatrix = new Array(15);
for (var i = 0; i < uncoverMatrix.length; i += 1) { uncoverMatrix[i] = new Array(30); }

export default {
  
  init() {
    if (isChromium) {
      mapCover.style.background = 'initial';
    }
  },

  showScoutMarkerFor: function(cardId) {
    const object = Props.getObject(cardId);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(object.x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(object.y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');
  },

  hideScoutMarker: function() {
    document.getElementById('scoutmarker').classList.add('is--hidden');
  },

  showObjectIconsByIds: function(objectIds) {
    objectIds?.forEach(objectId => {
      let object = Props.getObject(objectId);
      const x = object.x,
            y = object.y,
            group = object.group;

      if (!object.discovered) {
        if (group === 'building') {
          buidingsContainer.innerHTML += "<span class='icon icon-" + objectId + "' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" +
                                         "<img src='./img/icons/buildings/" + object.type + ".png'></span>";
        } else if (group === 'weapon') {
          buidingsContainer.innerHTML += "<span class='icon icon-" + objectId + "' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" +
                                         "<img src='./img/icons/weapons/" + group + ".png'></span>";
        } else if (group === 'zombie') {
          if (!object.dead) {
            highlightsContainer.innerHTML += "<span class='danger-area area-" + objectId + "' style='top: " + Math.round(y * 44.4 + 8) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>";
            buidingsContainer.innerHTML += "<span class='icon icon-" + objectId + "' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" +
                                           "<img src='./img/icons/buildings/" + group + ".png'></span>";  
          }
        }
      } else {
        if (group === 'zombie' && object.dead && !object.removed) {
          this.removeObjectIconById(objectId);
          buidingsContainer.innerHTML += "<span class='icon icon-" + objectId + "' style='top: " + Math.round(y * 44.4 + 3) + "px; left: " + Math.round(x * 44.4 + 12) + "px;'>" +
                                         "<img src='./img/icons/buildings/" + group + "-dead" + ".png'></span>";  
        }
      }
    });
  },

  removeObjectIconById: function(objectId) {
    buidingsContainer.querySelector(".icon.icon-" + objectId)?.remove();
    highlightsContainer.querySelector(".danger-area.area-" + objectId)?.remove();
  },

  highlightObject: function(objectId) {
    const object = Props.getObject(objectId);
    const objectIcon = document.querySelector('#maximap .icon-' + objectId);
    if (objectIcon) {
      objectIcon.classList.add('highlight');
    } else if (object.group === 'event') {
      // this needs a proper register mechanic: each event card registeres one or many iconIds it is connected to
      if (object.title === 'Waking Up') {
        document.getElementById('player').classList.add('highlight');
        document.getElementById('player-hint').classList.remove('is--hidden');        
      }
    }
  },

  noHighlightObject: function(objectId) {
    const object = Props.getObject(objectId);
    const objectIcon = document.querySelector('#maximap .icon-' + objectId);
    if (objectIcon) {
      objectIcon.classList.remove('highlight');
    } else if (object.group === 'event') {
      // this needs a proper register mechanic: each event card registeres one or many iconIds it is connected to
      if (object.title === 'Waking Up') {
        document.getElementById('player').classList.remove('highlight');
        document.getElementById('player-hint').classList.add('is--hidden');
      }
    }
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
