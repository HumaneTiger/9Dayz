import AudioUtils from './utils/audio-utils.js';

export default {
  init: function () {
    return AudioUtils.init();
  },

  playAmbientLoop: function () {
    return AudioUtils.playAmbientLoop();
  },

  music: function (name, delay, vol) {
    return AudioUtils.music(name, delay, vol);
  },

  voice: function (name, delay, vol) {
    return AudioUtils.voice(name, delay, vol);
  },

  sfx: function (name, delay, vol) {
    return AudioUtils.sfx(name, delay, vol);
  },

  sfxStop: function (name) {
    return AudioUtils.sfxStop(name);
  },

  stop: function (name, delay) {
    return AudioUtils.stop(name, delay);
  },
};
