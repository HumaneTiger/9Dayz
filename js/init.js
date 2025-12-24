import Binding from './binding.js';
import Start from './start.js';
import Ui from './ui.js';
import Editor from './editor.js';
import Props from './props.js';
import Map from './map.js';
import Cards from './cards.js';
import Actions from './actions.js';
import Battle from './battle.js';
import Cooking from './cooking.js';
import Crafting from './crafting.js';
import Character from './character.js';
import Almanac from './almanac.js';
import Preloading from './preloading.js';

const timeConfig = {
  startHour: 7,
  ticksPerHour: 6,
  tickInterval: 100,
  tickCurrent: 0,
};

window.timeIsUnity = {
  gameTick: 0,
  gameHours: 24 + timeConfig.startHour,
  gameDays: 1, // 1
  todayHours: timeConfig.startHour,
  todayTime: `0${timeConfig.startHour}:00`,
};

// initialize everything
{
  Props.init();
  Start.init();
  Ui.init();
  Editor.init();
  Map.init();
  Cards.init();
  Actions.init();
  Battle.init();
  Cooking.init();
  Crafting.init();
  Character.init();
  Almanac.init();
  bind();
  Ui.resizeViewport();
  initiateMainGameLoop();
  /* preloading goes here */
  Preloading.init();
}

function bind() {
  new Binding({
    object: window.timeIsUnity,
    property: 'gameDays',
    element: document.getElementById('gametime-days'),
  });
  new Binding({
    object: window.timeIsUnity,
    property: 'todayTime',
    element: document.getElementById('gametime-hours'),
  });
}

function triggerGameTick() {
  window.timeIsUnity.gameTick += 1;

  /* TICKY TASKS */
  if (window.timeIsUnity.gameTick % timeConfig.ticksPerHour === 0) {
    window.timeIsUnity.gameHours += 1;

    /* HOURLY TASKS */
    /* order matters */
    Props.hourlyTasks(window.timeIsUnity.todayHours);
    Ui.hourlyTasks(window.timeIsUnity.todayHours);
    Cards.hourlyTasks(window.timeIsUnity.todayHours);

    //Day.updateBrightness(timeIsUnity.todayHours);

    if (window.timeIsUnity.gameHours % 24 === 0) {
      window.timeIsUnity.gameDays += 1;

      /* DAILY TASKS */
      Ui.dailyTasks(window.timeIsUnity.gameDays);
    }
  }

  window.timeIsUnity.todayHours = window.timeIsUnity.gameHours - window.timeIsUnity.gameDays * 24;
  window.timeIsUnity.todayTime =
    window.timeIsUnity.todayHours < 10
      ? '0' + window.timeIsUnity.todayHours + ':'
      : window.timeIsUnity.todayHours + ':';
  window.timeIsUnity.todayTime += (window.timeIsUnity.gameTick % 6) + '0';
}

function initiateMainGameLoop() {
  window.setTimeout(() => {
    /* go foreward in time */
    timeConfig.tickCurrent += timeConfig.tickInterval;

    if (timeConfig.tickCurrent >= Props.getGameProp('speed')) {
      timeConfig.tickCurrent = 0;
      triggerGameTick();
    }

    if (!Props.getGameProp('gamePaused')) {
      initiateMainGameLoop();
    } else {
      idleLoop();
    }
  }, timeConfig.tickInterval);
}

function idleLoop() {
  window.setTimeout(() => {
    if (!Props.getGameProp('gamePaused')) {
      initiateMainGameLoop();
    } else {
      idleLoop();
    }
  }, 500);
}
