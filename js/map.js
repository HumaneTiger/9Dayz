import Props from './props.js';
import { ObjectState, MapManager } from './core/index.js';
import BuildingDefinitions from '../data/definitions/building-definitions.js';

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

export default {
  init: function () {
    MapManager.setupAllPaths();
  },

  showScoutMarkerFor: function (cardId) {
    const object = Props.getObject(cardId);
    const scoutMarker = document.getElementById('scoutmarker');

    scoutMarker.style.left = `${Math.round(object.x * 44.4)}px`;
    scoutMarker.style.top = `${Math.round(object.y * 44.4)}px`;
    scoutMarker.classList.remove('is--hidden');
  },

  hideScoutMarker: function () {
    document.getElementById('scoutmarker').classList.add('is--hidden');
  },

  showObjectIconsByIds: function (objectIds) {
    objectIds?.forEach(objectId => {
      const object = Props.getObject(objectId);
      const x = object.x,
        y = object.y,
        group = object.group;

      const iconLeft = Math.round(x * 44.4 + 12);
      const iconTop = Math.round(y * 44.4 + 3);
      const areaTop = Math.round(y * 44.4 + 8);

      const buildingProps = BuildingDefinitions.buildingProps[object.name];
      const iconType = buildingProps?.onBoardOnly ? 'onboard' : 'onmap';

      if (!object.discovered && !object.removed) {
        if (group === 'building') {
          buidingsContainer.insertAdjacentHTML(
            'beforeend',
            `<span class='icon icon-${objectId} ${iconType}' style='top: ${iconTop}px; left: ${iconLeft}px;'><img src='./img/icons/buildings/${object.type}.png'></span>`
          );
        } else if (group === 'weapon') {
          buidingsContainer.insertAdjacentHTML(
            'beforeend',
            `<span class='icon icon-${objectId} ${iconType}' style='top: ${iconTop}px; left: ${iconLeft}px;'><img src='./img/icons/weapons/${group}.png'></span>`
          );
        } else if (group === 'animal') {
          buidingsContainer.insertAdjacentHTML(
            'beforeend',
            `<span class='icon icon-${objectId} ${iconType}' style='top: ${iconTop}px; left: ${iconLeft}px;'><img src='./img/icons/animals/${group}.png'></span>`
          );
        } else if (group === 'zombie') {
          if (!object.dead) {
            highlightsContainer.insertAdjacentHTML(
              'beforeend',
              `<span class='danger-area area-${objectId} ${iconType}' style='top: ${areaTop}px; left: ${iconLeft}px;'></span>`
            );
            buidingsContainer.insertAdjacentHTML(
              'beforeend',
              `<span class='icon icon-${objectId} ${iconType}' style='top: ${iconTop}px; left: ${iconLeft}px;'><img src='./img/icons/buildings/${group}.png'></span>`
            );
          }
        } else if (group === 'npc') {
          buidingsContainer.insertAdjacentHTML(
            'beforeend',
            `<span class='icon icon-${objectId} onboard' style='top: ${iconTop}px; left: ${iconLeft}px;'><img src='./img/icons/npc/${group}.png'></span>`
          );
        }
      } else {
        if (group === 'zombie' && object.dead && !object.removed) {
          this.removeObjectIconById(objectId);
          buidingsContainer.insertAdjacentHTML(
            'beforeend',
            `<span class='icon icon-${objectId} ${iconType}' style='top: ${iconTop}px; left: ${iconLeft}px;'><img src='./img/icons/buildings/${group}-dead.png'></span>`
          );
        }
      }
    });
  },

  removeObjectIconById: function (objectId) {
    buidingsContainer.querySelector(`.icon.icon-${objectId}`)?.remove();
    highlightsContainer.querySelector(`.danger-area.area-${objectId}`)?.remove();
  },

  highlightObject: function (objectId, highlight = true) {
    const object = Props.getObject(objectId);
    const objectIcon = document.querySelector(`#maximap .icon-${objectId}`);
    if (objectIcon) {
      if (highlight) {
        objectIcon.classList.add('highlight');
      } else {
        objectIcon.classList.remove('highlight');
      }
    } else if (object.group === 'event') {
      if (object.highlightObjects) {
        const nearbyObjectIds = ObjectState.findAllObjectsNearby(object.x, object.y);
        nearbyObjectIds.forEach(nearbyObjectId => {
          const nearbyObject = Props.getObject(nearbyObjectId);
          if (
            (nearbyObject.group === 'building' && nearbyObject.type === object.highlightObjects) ||
            nearbyObject.group === object.highlightObjects
          ) {
            const nearbyObjectIcon = document.querySelector(`#maximap .icon-${nearbyObjectId}`);
            if (nearbyObjectIcon) {
              if (highlight) {
                nearbyObjectIcon.classList.add('highlight');
              } else {
                nearbyObjectIcon.classList.remove('highlight');
              }
            }
          }
        });
      } else if (object.title === 'Waking Up') {
        if (highlight) {
          document.getElementById('player').classList.add('highlight');
          document.getElementById('player-hint').classList.remove('is--hidden');
        } else {
          document.getElementById('player').classList.remove('highlight');
          document.getElementById('player-hint').classList.add('is--hidden');
        }
      }
    }
  },

  moveMapXTo: function (x) {
    MapManager.setPositionX(x * 44.4);
    this.updateMapPosition();
  },

  moveMapYTo: function (y) {
    MapManager.setPositionY((MapManager.getMapPosition().refY - y) * 44.4);
    this.updateMapPosition();
  },

  updateMapPosition() {
    const mapPosition = MapManager.getMapPosition();
    map.style.transform = `translate3d(${mapPosition.x}px, ${mapPosition.y}px, 0)`;
  },

  showTargetLocation: function (target) {
    const targetLocations = Props.getAllTargetLocations();
    if (targetLocations[target]) {
      const x = targetLocations[target][0];
      const y = targetLocations[target][1];
      const locationLeft = Math.round(x * 44.4 + 12);
      const locationTop = Math.round(y * 44.4 + 3);
      mapCover.insertAdjacentHTML(
        'beforeend',
        `<span class='location' style='top: ${locationTop}px; left: ${locationLeft}px;'>${target}</span>`
      );
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
    const fogGradient = mapFog2dCtx.createRadialGradient(maskX, maskY, 300, maskX, maskY, 100);
    fogGradient.addColorStop(0, 'rgba(0,0,0,0)');
    fogGradient.addColorStop(1, 'rgba(0,0,0,1)');
    mapFog2dCtx.fillStyle = fogGradient;
    mapFog2dCtx.beginPath();
    mapFog2dCtx.arc(maskX, maskY, 300, 0, 2 * Math.PI);
    mapFog2dCtx.closePath();
    mapFog2dCtx.fill();
  },
};
