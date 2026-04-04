import Props from './props.js';

const viewport = document.getElementById('viewport');
const mapBorder = document.getElementById('map-border');

let zoom = 1;
let maxZoom = 1.9;

export default {
  init() {
    window.addEventListener('resize', this.resizeViewport.bind(this));
    document.body.addEventListener('wheel', this.handleMouseWheel.bind(this));
    this.resizeViewport();
  },

  zoomMap: function (deltaY, limitZoom) {
    if (limitZoom) {
      if (zoom > limitZoom) zoom = limitZoom;
      maxZoom = limitZoom;
    } else if (deltaY > 0) {
      zoom > 1 ? (zoom -= 0.1) : false;
    } else if (zoom < maxZoom) {
      zoom += 0.1;
    }
    viewport.querySelector('#maximap .inner').style.transform = 'scale(' + zoom + ')';
  },

  resetZoom: function () {
    maxZoom = 1.9;
  },

  showMapBorder: function () {
    mapBorder.classList.add('in-front');
  },

  resizeViewport: function () {
    const viewWidth = window.innerWidth,
      viewHeight = window.innerHeight;

    if (viewWidth / viewHeight < 1.73) {
      Props.setGameProp('scaleFactor', viewWidth / 2135);
      Props.setGameProp('viewMode', 'vertical');
      mapBorder.style.transform =
        'scale3d(' +
        Props.getGameProp('scaleFactor') * 1.173 +
        ',' +
        Props.getGameProp('scaleFactor') * 1.173 +
        ', 1) translate3d(-5%, -50% , 0)';
    } else {
      Props.setGameProp('scaleFactor', viewHeight / 1200);
      Props.setGameProp('viewMode', 'horizontal');
      mapBorder.removeAttribute('style');
    }
    mapBorder.classList.remove('horizontal', 'vertical');
    mapBorder.classList.add(Props.getGameProp('viewMode'));
    viewport.style.transform =
      'scale3d(' +
      Props.getGameProp('scaleFactor') +
      ',' +
      Props.getGameProp('scaleFactor') +
      ', 1) translate3d(-50%, -50% , 0)';
    this.handleFullscreenChange();
  },

  handleFullscreenChange: function () {
    if (document.fullscreenElement) {
      document.querySelector('#actions .fullscreen .fullscreen--on').classList.add('is--hidden');
      document
        .querySelector('#actions .fullscreen .fullscreen--off')
        .classList.remove('is--hidden');
    } else {
      document.querySelector('#actions .fullscreen .fullscreen--on').classList.remove('is--hidden');
      document.querySelector('#actions .fullscreen .fullscreen--off').classList.add('is--hidden');
    }
  },

  handleMouseWheel: function (ev) {
    const target = ev.target;
    const cardsContainer = target.closest('#cards');
    if (cardsContainer) return; // do not zoom when mouse is over cards container
    ev.stopPropagation();
    this.zoomMap(ev.deltaY);
  },
};
