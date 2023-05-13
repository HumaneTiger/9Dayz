import Binding from './binding.js'
import Ui from './ui.js'
import Props from './props.js'
import Map from './map.js'
import Player from './player.js'
import Cards from './cards.js'
import Items from './items.js'
import Actions from './actions.js'

let startHour = 7; // 7
let tick = 0;
let ticksPerHour = 6;
let tickInterval = 100;
let tickCurrent = 0;

let timeIsUnity = {
    gameHours: 24 + startHour,
    gameDays: 1,
    todayHours: startHour,
    todayTime: '0' + startHour + ':00'
}

init();

function init() {

  Props.init();
  Ui.init();
  Map.init();
  Player.init();
  Cards.init();
  Items.init();
  Actions.init();
  //Map.numberQuadrants();

  bind();

  Ui.resizeViewport();
    
  initiateMainGameLoop();

}

function bind() {
    new Binding({
        object: timeIsUnity,
        property: 'gameDays',
        element: document.getElementById('gametime-days')
    })
    new Binding({
        object: timeIsUnity,
        property: 'todayTime',
        element: document.getElementById('gametime-hours')
    })
}

function triggerGameTick() {

    tick += 1;
    
    /* TICKY TASKS */
    if (tick % ticksPerHour === 0) {

        timeIsUnity.gameHours += 1;

        /* HOURLY TASKS */
        Ui.hourlyTasks(timeIsUnity.todayHours);

        //Day.updateBrightness(timeIsUnity.todayHours);

        if (timeIsUnity.gameHours % 24 === 0) {

            timeIsUnity.gameDays += 1;

            /* DAILY TASKS */
            Ui.dailyTasks(timeIsUnity.gameDays);
        }
    }

    timeIsUnity.todayHours = timeIsUnity.gameHours - timeIsUnity.gameDays * 24;    
    timeIsUnity.todayTime = timeIsUnity.todayHours < 10 ? '0' + timeIsUnity.todayHours + ':' : timeIsUnity.todayHours + ':';
    timeIsUnity.todayTime += (tick % 6) + '0';
}

function initiateMainGameLoop() {

    window.setTimeout(function() {

        /* go foreward in time */
        tickCurrent += tickInterval;

        if (tickCurrent >= Props.getGameSpeedDefault()) {
            tickCurrent = 0;
            triggerGameTick();
        }

        if (!Ui.isGamePaused()) {
            initiateMainGameLoop();
        } else {
            idleLoop();
        }

    }, tickInterval);
}

/*
function initiateMainGameLoop() {

    window.setTimeout(function() {

        // go foreward in time

        tick += 1;

        // TICKY TASKS

        if (tick % ticksPerHour === 0) {
    
            timeIsUnity.gameHours += 1;

            // HOURLY TASKS

            Ui.hourlyTasks(timeIsUnity.todayHours);

            //Day.updateBrightness(timeIsUnity.todayHours);

            if (timeIsUnity.gameHours % 24 === 0) {

                timeIsUnity.gameDays += 1;

                // DAILY TASKS

                Ui.dailyTasks(timeIsUnity.gameDays);

            }
    
        }

        timeIsUnity.todayHours = timeIsUnity.gameHours - timeIsUnity.gameDays * 24;    
        timeIsUnity.todayTime = timeIsUnity.todayHours < 10 ? '0' + timeIsUnity.todayHours + ':' : timeIsUnity.todayHours + ':';
        timeIsUnity.todayTime += (tick % 6) + '0';

        if (!Ui.isGamePaused()) {
          initiateMainGameLoop();
        } else {
          idleLoop();
        }

    }, tickInterval);

}
*/

function idleLoop() {
    window.setTimeout(function() {
        if (!Ui.isGamePaused()) {
            initiateMainGameLoop();
        } else {
            idleLoop();
        }
    }, 500);
}

