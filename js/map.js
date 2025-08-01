import Props from './props.js';

const buidingsContainer = document.querySelector('.map .map-buildings');
const highlightsContainer = document.querySelector('.map .map-highlights');

const map = document.querySelector('#maximap .map');
const mapCover = map.querySelector('.map-cover .cover');

const fogImage = map.querySelector('.map-cover img');
const mapFog2dCtx = document.getElementById('map-fog').getContext('2d');
let canvasPrimed = false;

let uncoverMatrix = new Array(15);
for (var i = 0; i < uncoverMatrix.length; i += 1) {
  uncoverMatrix[i] = new Array(30);
}

let mapPosition = {
  refX: 12,
  refY: 33,
  x: 0,
  y: -311,
};

export default {
  init: function () {},

  showScoutMarkerFor: function (cardId) {
    const object = Props.getObject(cardId);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = Math.round(object.x * 44.4) + 'px';
    scoutMarker.style.top = Math.round(object.y * 44.4) + 'px';
    scoutMarker.classList.remove('is--hidden');
  },

  hideScoutMarker: function () {
    document.getElementById('scoutmarker').classList.add('is--hidden');
  },

  showObjectIconsByIds: function (objectIds) {
    objectIds?.forEach(objectId => {
      let object = Props.getObject(objectId);
      const x = object.x,
        y = object.y,
        group = object.group;

      if (!object.discovered) {
        if (group === 'building') {
          buidingsContainer.innerHTML +=
            "<span class='icon icon-" +
            objectId +
            "' style='top: " +
            Math.round(y * 44.4 + 3) +
            'px; left: ' +
            Math.round(x * 44.4 + 12) +
            "px;'>" +
            "<img src='./img/icons/buildings/" +
            object.type +
            ".png'></span>";
        } else if (group === 'weapon') {
          buidingsContainer.innerHTML +=
            "<span class='icon icon-" +
            objectId +
            "' style='top: " +
            Math.round(y * 44.4 + 3) +
            'px; left: ' +
            Math.round(x * 44.4 + 12) +
            "px;'>" +
            "<img src='./img/icons/weapons/" +
            group +
            ".png'></span>";
        } else if (group === 'zombie') {
          if (!object.dead) {
            highlightsContainer.innerHTML +=
              "<span class='danger-area area-" +
              objectId +
              "' style='top: " +
              Math.round(y * 44.4 + 8) +
              'px; left: ' +
              Math.round(x * 44.4 + 12) +
              "px;'>";
            buidingsContainer.innerHTML +=
              "<span class='icon icon-" +
              objectId +
              "' style='top: " +
              Math.round(y * 44.4 + 3) +
              'px; left: ' +
              Math.round(x * 44.4 + 12) +
              "px;'>" +
              "<img src='./img/icons/buildings/" +
              group +
              ".png'></span>";
          }
        }
      } else {
        if (group === 'zombie' && object.dead && !object.removed) {
          this.removeObjectIconById(objectId);
          buidingsContainer.innerHTML +=
            "<span class='icon icon-" +
            objectId +
            "' style='top: " +
            Math.round(y * 44.4 + 3) +
            'px; left: ' +
            Math.round(x * 44.4 + 12) +
            "px;'>" +
            "<img src='./img/icons/buildings/" +
            group +
            '-dead' +
            ".png'></span>";
        }
      }
    });
  },

  removeObjectIconById: function (objectId) {
    buidingsContainer.querySelector('.icon.icon-' + objectId)?.remove();
    highlightsContainer.querySelector('.danger-area.area-' + objectId)?.remove();
  },

  highlightObject: function (objectId) {
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

  noHighlightObject: function (objectId) {
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

  moveMapXTo: function (x) {
    mapPosition.x = x * 44.4;
    this.updateMapPosition();
  },

  moveMapYTo: function (y) {
    mapPosition.y = (mapPosition.refY - y) * 44.4;
    this.updateMapPosition();
  },

  updateMapPosition() {
    map.style.transform = 'translate3d(' + mapPosition.x + 'px, ' + mapPosition.y + 'px, 0)';
  },

  showTargetLocation: function (target) {
    let targetLocations = Props.getAllTargetLocations();
    if (targetLocations[target]) {
      let x = targetLocations[target][0];
      let y = targetLocations[target][1];
      mapCover.innerHTML +=
        "<span class='location' style='top: " +
        Math.round(y * 44.4 + 3) +
        'px; left: ' +
        Math.round(x * 44.4 + 12) +
        "px;'>" +
        target +
        '</span>';
    }
  },

  mapUncoverAt: function (x, y) {
    const uncoverX = Math.floor(x / 4);
    const uncoverY = Math.floor(y / 4);
    if (mapFog2dCtx && uncoverMatrix[uncoverX][uncoverY] === undefined) {
      uncoverMatrix[uncoverX][uncoverY] = true;
      if (canvasPrimed) {
        this.addNewMask(uncoverX, uncoverY);
      } else {
        if (fogImage.complete) {
          this.primeCanvas();
          this.addNewMask(uncoverX, uncoverY);
        } else {
          fogImage.addEventListener('load', () => {
            this.primeCanvas();
            this.addNewMask(uncoverX, uncoverY);
          });
        }
      }
    }
  },

  primeCanvas: function () {
    mapFog2dCtx.drawImage(fogImage, 0, 0, 2135, 2135);
    mapFog2dCtx.globalCompositeOperation = 'destination-out';
    canvasPrimed = true;
  },

  addNewMask: function (x, y) {
    const maskX = x * 44.4 * 4 + 40;
    const maskY = y * 44.4 * 4;
    let fogGradient = mapFog2dCtx.createRadialGradient(maskX, maskY, 300, maskX, maskY, 100);
    fogGradient.addColorStop(0, 'rgba(0,0,0,0)');
    fogGradient.addColorStop(1, 'rgba(0,0,0,1)');
    mapFog2dCtx.fillStyle = fogGradient;
    mapFog2dCtx.beginPath();
    mapFog2dCtx.arc(maskX, maskY, 300, 0, 2 * Math.PI);
    mapFog2dCtx.closePath();
    mapFog2dCtx.fill();
  },
};
