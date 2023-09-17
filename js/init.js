import Binding from './binding.js'
import Start from './start.js'
import Ui from './ui.js'
import Editor from './editor.js'
import Props from './props.js'
import Map from './map.js'
import Player from './player.js'
import Cards from './cards.js'
import Items from './items.js'
import Actions from './actions.js'
import Battle from './battle.js'
import Cooking from './cooking.js'

let startHour = 21; // 7
let tick = 0;
let ticksPerHour = 6; // 6
let tickInterval = 100;
let tickCurrent = 0;

let timeIsUnity = {
    gameHours: 24 + startHour,
    gameDays: 1,
    todayHours: startHour,
    todayTime: '0' + startHour + ':00'
}

// initialize everything
{
  Props.init();
  Start.init();
  Ui.init();
  Editor.init();
  Map.init();
  Player.init();
  Cards.init();
  Items.init();
  Actions.init();
  Battle.init();
  Cooking.init(); 
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
        /* order matters */
        Props.hourlyTasks(timeIsUnity.todayHours);
        Ui.hourlyTasks(timeIsUnity.todayHours);
        Cards.hourlyTasks(timeIsUnity.todayHours);

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

        if (tickCurrent >= Props.getGameProp('speed')) {
            tickCurrent = 0;
            triggerGameTick();
        }

        if (!Props.getGameProp('gamePaused')) {
            initiateMainGameLoop();
        } else {
            idleLoop();
        }

    }, tickInterval);
}

function idleLoop() {
    window.setTimeout(function() {
        if (!Props.getGameProp('gamePaused')) {
            initiateMainGameLoop();
        } else {
            idleLoop();
        }
    }, 500);
}

