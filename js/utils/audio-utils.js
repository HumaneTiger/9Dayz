import TimingUtils from './timing-utils.js';

let allAudio = document.getElementById('all-audio');
let ambientIndex = 1;
let ambientTimes = [60, 110, 145, 145];
let ambientDelay = 10;

export default {
  init: function () {
    //this.playAmbientLoop();
  },

  playAmbientLoop: async function () {
    this.music('ambient-' + ambientIndex);
    await TimingUtils.wait((ambientTimes[ambientIndex - 1] + ambientDelay) * 1000);
    ambientIndex += 1;
    if (ambientIndex > 4) ambientIndex = 1;
    this.playAmbientLoop();
  },

  music: async function (name, delay, vol) {
    await TimingUtils.wait(delay || 0);
    let audio = allAudio.querySelector('.music-' + name);
    let volume = vol || 0.2;
    audio.volume = volume;

    audio.play().catch(() => {});
  },

  voice: async function (name, delay, vol) {
    await TimingUtils.wait(delay || 0);
    let audio = allAudio.querySelector('.voice-' + name);
    let volume = vol || 0.2;
    audio.volume = volume;

    audio.play().catch(() => {});
  },

  sfx: async function (name, delay, vol) {
    await TimingUtils.wait(delay || 0);
    this.sfxStop(name);
    let audio = allAudio.querySelector('.sfx-' + name);
    let volume = vol || 0.3;
    audio.volume = name === 'click' ? 0.15 : volume;

    audio.play().catch(() => {});
  },

  sfxStop: function (name) {
    let audio = allAudio.querySelector('.sfx-' + name);
    audio.volume = 0;
    audio.pause();
    audio.currentTime = 0;
  },

  stop: async function (name, delay) {
    await TimingUtils.wait(delay || 0);
    let audio = allAudio.querySelector('.music-' + name);
    audio.volume = 0;
    audio.pause();
    audio.currentTime = 0;
  },
};
