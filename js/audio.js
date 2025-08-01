let allAudio = document.getElementById('all-audio');
let ambientIndex = 1;
let ambientTimes = [60, 110, 145, 145];
let ambientDelay = 10;

export default {
  init: function () {
    //this.playAmbientLoop();
  },

  playAmbientLoop: function () {
    this.music('ambient-' + ambientIndex);
    window.setTimeout(
      () => {
        ambientIndex += 1;
        if (ambientIndex > 4) ambientIndex = 1;
        this.playAmbientLoop();
      },
      (ambientTimes[ambientIndex - 1] + ambientDelay) * 1000
    );
  },

  music: function (name, delay, vol) {
    window.setTimeout(() => {
      let audio = allAudio.querySelector('.music-' + name);
      let volume = vol || 0.2;

      audio.volume = volume;

      audio.play().catch(() => {});
    }, delay || 0);
  },

  voice: function (name, delay, vol) {
    window.setTimeout(() => {
      let audio = allAudio.querySelector('.voice-' + name);
      let volume = vol || 0.2;

      audio.volume = volume;

      audio.play().catch(() => {});
    }, delay || 0);
  },

  sfx: function (name, delay, vol) {
    window.setTimeout(() => {
      this.sfxStop(name);
      let audio = allAudio.querySelector('.sfx-' + name);
      let volume = vol || 0.3;

      audio.volume = name === 'click' ? 0.15 : volume;

      audio.play().catch(() => {});
    }, delay || 0);
  },

  sfxStop: function (name) {
    let audio = allAudio.querySelector('.sfx-' + name);
    audio.volume = 0;
    audio.pause();
    audio.currentTime = 0;
  },

  stop: function (name, delay) {
    window.setTimeout(() => {
      let audio = allAudio.querySelector('.music-' + name);

      audio.volume = 0;
      audio.pause();
      audio.currentTime = 0;
    }, delay || 0);
  },
};
