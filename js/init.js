import Start from './start.js';
import Ui from './ui.js';
import Editor from './editor.js';
import Props from './props.js';
import Map from './map.js';
import Cards from './cards.js';
import Items from './items.js';
import Actions from './actions.js';
import Cooking from './cooking.js';
import Crafting from './crafting.js';
import Character from './character.js';
import Almanac from './almanac.js';
import Preloading from './preloading.js';
import Player from './player.js';
import Tutorial from './tutorial.js';
import TestRecorder from './test-recorder.js';
import TestPlayer from './test-player.js';

// initialize everything
{
  Props.init();

  // Wrap event handlers for test recording
  if (Props.getGameProp('local')) {
    TestRecorder.init();
    TestPlayer.init();
    Start.handleClick = TestRecorder.wrapEventHandler(
      'Start',
      'handleClick',
      Start.handleClick.bind(Start)
    );
    Ui.handleClick = TestRecorder.wrapEventHandler('Ui', 'handleClick', Ui.handleClick.bind(Ui));
    Ui.mouseUp = TestRecorder.wrapEventHandler('Ui', 'mouseUp', Ui.mouseUp.bind(Ui));
    Cards.checkForCardClick = TestRecorder.wrapEventHandler(
      'Cards',
      'checkForCardClick',
      Cards.checkForCardClick.bind(Cards)
    );
    Items.checkForSlotClick = TestRecorder.wrapEventHandler(
      'Items',
      'checkForSlotClick',
      Items.checkForSlotClick.bind(Items)
    );
    Crafting.checkCraftActionClick = TestRecorder.wrapEventHandler(
      'Crafting',
      'checkCraftActionClick',
      Crafting.checkCraftActionClick.bind(Crafting)
    );
    Character.checkForSlotClick = TestRecorder.wrapEventHandler(
      'Character',
      'checkForSlotClick',
      Character.checkForSlotClick.bind(Character)
    );
    Cooking.checkForCardClick = TestRecorder.wrapEventHandler(
      'Cooking',
      'checkForCardClick',
      Cooking.checkForCardClick.bind(Cooking)
    );
    Player.handleKeydown = TestRecorder.wrapEventHandler(
      'Player',
      'handleKeydown',
      Player.handleKeydown.bind(Player)
    );
    Tutorial.handleUserInput = TestRecorder.wrapEventHandler(
      'Tutorial',
      'handleUserInput',
      Tutorial.handleUserInput.bind(Tutorial)
    );
  }

  Start.init();
  Ui.init();
  Editor.init();
  Map.init();
  Cards.init();
  Actions.init();
  Cooking.init();
  Crafting.init();
  Character.init();
  Almanac.init();
  Tutorial.init();
  Ui.resizeViewport();
  initiateMainGameLoop();
  Preloading.init();

  // parse URL query to decide whether to start test playback
  const urlParams = new URLSearchParams(window.location.search);
  const testName = urlParams.get('startPlayback');

  if (testName) {
    Props.setGameProp('testPlayback', true);
    Editor.startPlayback(testName);
  }
}

function triggerGameTick() {
  const time = Props.getGameProp('timeIsUnity');
  const timeConfig = Props.getGameProp('timeConfig');
  const newGameTick = time.gameTick + 1;
  let updates = { gameTick: newGameTick };

  /* TICKY TASKS */
  if (newGameTick % timeConfig.ticksPerHour === 0) {
    const newGameHours = time.gameHours + 1;
    updates.gameHours = newGameHours;
    if (newGameHours % 24 === 0) {
      updates.gameDays = time.gameDays + 1;
    }
  }

  // Calculate derived time values
  const gameDays = updates.gameDays !== undefined ? updates.gameDays : time.gameDays;
  const gameHours = updates.gameHours !== undefined ? updates.gameHours : time.gameHours;
  const gameTick = updates.gameTick;

  updates.todayHours = gameHours - gameDays * 24;
  const hourString = String(updates.todayHours).padStart(2, '0');
  const minuteString = String(gameTick % timeConfig.ticksPerHour).padStart(1, '0') + '0';
  updates.todayTime = hourString + ':' + minuteString;

  Props.updateTimeIsUnity(updates);
}

function initiateMainGameLoop() {
  window.setTimeout(() => {
    /* go foreward in time */
    // Two-layer timing: tickInterval (100ms heartbeat) runs constantly,
    // tickCurrent accumulates until it reaches 'gameTickThreshold' (normally 4000ms).
    // For fast-forward (sleep), gameTickThreshold drops to 100ms → game tick every heartbeat (40x faster)
    const timeConfig = Props.getGameProp('timeConfig');
    timeConfig.tickCurrent += timeConfig.tickInterval;

    if (timeConfig.tickCurrent >= timeConfig.gameTickThreshold) {
      timeConfig.tickCurrent = 0;
      Props.setGameProp('timeConfig', timeConfig);
      triggerGameTick();
    }

    if (!Props.getGameProp('gamePaused')) {
      initiateMainGameLoop();
    } else {
      idleLoop();
    }
  }, Props.getGameProp('timeConfig').tickInterval);
}

function idleLoop() {
  window.setTimeout(() => {
    if (!Props.getGameProp('gamePaused')) {
      initiateMainGameLoop();
    } else {
      idleLoop();
    }
  }, 2500);
}
