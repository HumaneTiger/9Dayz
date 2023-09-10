import Ui from './ui.js'
import Start from './start.js'

let allAudio = document.getElementById("all-audio");
let ambientIndex = 1;
let ambientTimes = [60, 110, 145, 145];
let ambientDelay = 10;

export default {

    init() {
      this.playAmbientLoop();
    },

    playAmbientLoop: function() {
      this.music('ambient-' + ambientIndex);
      window.setTimeout(function() {
        ambientIndex += 1;
        if (ambientIndex > 4) ambientIndex = 1;
        this.playAmbientLoop();
      }.bind(this), (ambientTimes[ambientIndex-1] + ambientDelay) * 1000);
    },

    music(name, delay, vol) {

        window.setTimeout(function() {

            let audio = allAudio.querySelector('.music-' + name);
            let volume = vol || 0.2;

            audio.volume = volume;
            
            if (Start.userHasInteracted()) audio.play();

        }.bind(this), delay || 0);

    },

    voice(name, delay, vol) {

        window.setTimeout(function() {

            let audio = allAudio.querySelector('.voice-' + name);
            let volume = vol || 0.2;

            audio.volume = volume;
            if (Start.userHasInteracted()) audio.play();

        }, delay || 0);

    },

    sfx(name, delay, vol) {

        window.setTimeout(function() {

            this.sfxStop(name);
            let audio = allAudio.querySelector('.sfx-' + name);
            let volume = vol || 0.3;

            audio.volume = volume;
            if (Start.userHasInteracted()) audio.play();

        }.bind(this), delay || 0);

    },

    sfxStop(name) {

      let audio = allAudio.querySelector('.sfx-' + name);
      audio.volume = 0;
      audio.pause();
      audio.currentTime = 0;

    },

    stop(name, delay) {

        window.setTimeout(function() {

            let audio = allAudio.querySelector('.music-' + name);
            
            audio.volume = 0;
            audio.pause();
            audio.currentTime = 0;
            
        }, delay || 0);

    }

}