import Props from './props.js';
import Checkpoint from './checkpoint.js';
import Start from './start.js';
import Ui from './ui.js';
import Items from './items.js';
import Map from './map.js';
import Player from './player.js';
import TestPlayer from './test-player.js';
import TestRecorder from './test-recorder.js';

let squareX = 0,
  squareY = 0;
let squareFreeze = true;
const cardConsoleContainer = document.getElementById('card-console');

export default {
  init: function () {
    document.body.addEventListener('click', this.handleClick.bind(this));
    this.initDevConsole();
    TestPlayer.init();
  },

  getActionType: function (element) {
    const actions = [
      'handle',
      'select-square',
      'place-object',
      'beam-character',
      'shift-time',
      'start-playback',
      'stop-playback',
      'start-recording',
      'stop-recording',
    ];
    return actions.find(action => element.classList.contains(action));
  },

  handleClick: function (ev) {
    const target = ev.target;
    const leftMouseButton = ev.button === 0;

    if (leftMouseButton) {
      if (target.closest('#card-console')) {
        const actionType = this.getActionType(target);

        switch (actionType) {
          case 'handle':
            cardConsoleContainer.classList.toggle('out');
            break;

          case 'select-square':
            squareFreeze = false;
            squareX = 0;
            squareY = 0;
            cardConsoleContainer.querySelector('.selected-square').textContent = '';
            document.getElementById('square-marker').classList.remove('freeze');
            document.getElementById('square-marker').classList.remove('is--hidden');
            break;

          case 'place-object':
            if (squareX || squareY) {
              let selectedObject = cardConsoleContainer.querySelector('.select-object').value;
              if (selectedObject === 'zombie') {
                Props.setZedAt(squareX, squareY, 1);
              } else if (selectedObject === 'rats') {
                const creaturesList = Props.createCreaturesList('rat');
                Props.spawnCreaturesAt(squareX, squareY, creaturesList);
              } else if (selectedObject === 'bees') {
                const creaturesList = Props.createCreaturesList('bee');
                Props.spawnCreaturesAt(squareX, squareY, creaturesList);
              } else if (
                selectedObject === 'improvised-axe' ||
                selectedObject === 'axe' ||
                selectedObject === 'wooden-club' ||
                selectedObject === 'baseball-bat' ||
                selectedObject === 'wrench' ||
                selectedObject === 'improvised-whip' ||
                selectedObject === 'fishing-rod'
              ) {
                Props.setupWeapon(squareX, squareY, selectedObject);
              } else if (selectedObject === 'care-package') {
                Props.beginInventoryBatch();
                Props.addItemToInventory('tomato', 1);
                Props.addItemToInventory('carrot', 1);
                Props.addItemToInventory('pepper', 1);
                Props.addItemToInventory('tape', 1);
                Props.addItemToInventory('drink-2', 2);
                Props.addItemToInventory('snack-1', 2);
                Props.addItemToInventory('snack-2', 2);
                Props.addItemToInventory('knife', 1);
                Props.addItemToInventory('energy-pills', 1);
                Props.endInventoryBatch();
              } else if (selectedObject === 'beehive') {
                Props.setupBuilding(squareX, squareY, ['beehive'], true); // infested
              } else if (selectedObject === 'doggy') {
                Props.spawnDoggyAt(squareX, squareY);
              } else {
                Props.setupBuilding(squareX, squareY, new Array(selectedObject));
              }
              Player.updatePlayer();
              squareFreeze = true;
              document.getElementById('square-marker').classList.remove('freeze');
              document.getElementById('square-marker').classList.add('is--hidden');
            }
            break;

          case 'beam-character':
            if (squareX || squareY) {
              Player.setPlayerPosition(squareX, squareY);
              Player.updatePlayer(true);
              squareFreeze = true;
              document.getElementById('square-marker').classList.remove('freeze');
              document.getElementById('square-marker').classList.add('is--hidden');
            }
            break;

          case 'shift-time': {
            const selectedDay = parseInt(cardConsoleContainer.querySelector('.select-day').value);
            const todayHours = 7;
            Props.updateTimeIsUnity({
              gameTick: 0,
              gameHours: 24 * selectedDay + todayHours,
              gameDays: selectedDay,
              todayHours: todayHours,
              todayTime: `0${todayHours}:00`,
            });
            Props.setGameProp('startDay', selectedDay);
            Checkpoint.adjustDayTimeUI();
            Ui.showNewDay(0, true);
            break;
          }

          case 'start-playback':
            this.handleStartPlaybackButton();
            break;

          case 'stop-playback':
            this.stopPlayback();
            break;

          case 'start-recording':
            this.startRecording();
            break;

          case 'stop-recording':
            this.stopRecording();
            break;
        }
      }
    }
  },

  initDevConsole: function () {
    const selectObject = cardConsoleContainer.querySelector('.select-object');
    const allBuildings = Props.getBuildingProps();
    const allWeapons = Props.getWeaponProps();

    document.getElementById('viewport').addEventListener('mousemove', this.showSquare.bind(this));
    document.getElementById('viewport').addEventListener('mousedown', this.selectSquare.bind(this));

    let optCare = document.createElement('option');
    optCare.value = 'care-package';
    optCare.innerHTML = 'Care Package';
    selectObject.appendChild(optCare);

    let optZombie = document.createElement('option');
    optZombie.value = 'zombie';
    optZombie.innerHTML = 'Zombie';
    selectObject.appendChild(optZombie);

    let optRats = document.createElement('option');
    optRats.value = 'rats';
    optRats.innerHTML = 'Rats';
    selectObject.appendChild(optRats);

    let optBees = document.createElement('option');
    optBees.value = 'bees';
    optBees.innerHTML = 'Bees';
    selectObject.appendChild(optBees);

    let optDoggy = document.createElement('option');
    optDoggy.value = 'doggy';
    optDoggy.innerHTML = 'Doggy';
    selectObject.appendChild(optDoggy);

    for (const weapon in allWeapons) {
      let opt = document.createElement('option');
      opt.value = weapon;
      opt.innerHTML = Items.capitalizeFirstLetter(weapon.replaceAll('-', ' '));
      selectObject.appendChild(opt);
    }

    for (const building in allBuildings) {
      let opt = document.createElement('option');
      opt.value = building;
      opt.innerHTML = Items.capitalizeFirstLetter(building.replaceAll('-', ' '));
      selectObject.appendChild(opt);
    }

    // Populate test select dropdown

    const urlParams = new URLSearchParams(window.location.search);
    const runningTestName = urlParams.get('startPlayback');

    const selectTest = cardConsoleContainer.querySelector('.select-test');
    const testData = TestPlayer.getTestData();

    for (const testName in testData) {
      const test = testData[testName];
      let opt = document.createElement('option');
      opt.value = testName;
      opt.selected = testName === runningTestName;
      opt.innerHTML = `${testName} - ${test.description}`;
      selectTest.appendChild(opt);
    }
  },

  showSquare: function (ev) {
    const viewportRect = document.getElementById('viewport').getBoundingClientRect();
    const playerPosition = Player.getPlayerPosition();
    let mouseX, mouseY;

    if (!squareFreeze) {
      mouseX = Math.floor(
        (ev.clientX - viewportRect.left) / Props.getGameProp('scaleFactor') / 44.4
      );
      mouseY = Math.floor(
        (ev.clientY - 23 - viewportRect.top) / Props.getGameProp('scaleFactor') / 44.4
      );

      squareX = mouseX;
      if (playerPosition.y < 20) {
        squareY = mouseY;
      } else if (playerPosition.y > 40) {
        squareY = mouseY + 21;
      } else {
        squareY = mouseY + (21 - (40 - playerPosition.y));
      }
      cardConsoleContainer.querySelector('.selected-square').textContent =
        '(' + squareX + ', ' + squareY + ')';
      document.getElementById('square-marker').style.left = mouseX * 44.4 + 'px';
      document.getElementById('square-marker').style.top = mouseY * 44.4 + 23 + 'px';
      Map.mapUncoverAt(squareX, squareY);
    }
  },

  selectSquare: function () {
    if (squareX || squareY) {
      squareFreeze = true;
      document.getElementById('square-marker').classList.add('freeze');
    }
  },

  /**
   * Log message to test feedback UI
   */
  logTest: function (message, type = 'info') {
    const feedback = cardConsoleContainer.querySelector('.test-feedback');
    if (feedback) {
      const icon =
        type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
      feedback.insertAdjacentHTML('beforeend', `<p>${icon} ${message}</p>`);
      feedback.scrollTop = feedback.scrollHeight;
      if (type === 'error') {
        feedback.classList.remove('is--playing');
        feedback.classList.add('has--errors');
      } else if (type === 'success') {
        feedback.classList.remove('is--playing');
        feedback.classList.add('has--success');
      }
    }
  },

  /**
   * Clear test feedback
   */
  clearTestFeedback: function () {
    const feedback = document.querySelector('.test-feedback');
    if (feedback) {
      feedback.innerHTML = '';
    }
  },

  handleStartPlaybackButton: function () {
    const selectedTest = cardConsoleContainer.querySelector('.select-test').value;
    document.location.href = `?startPlayback=${selectedTest}`;
  },

  /**
   * Run test playback
   */
  startPlayback: function (testName) {
    cardConsoleContainer.querySelector('.stop-playback').classList.remove('is--hidden');
    cardConsoleContainer.querySelector('.start-recording').classList.add('is--hidden');

    cardConsoleContainer.classList.remove('out');
    this.clearTestFeedback();

    try {
      const testNameToUse = testName || (Props.getGameProp('local') ? 'test-local' : 'test-run-1');
      TestPlayer.loadTestData(testNameToUse, (testName, testCheckpoint) => {
        this.logTest(`Starting test playback for <strong>${testName}</strong>...`);
        Start.restoreCheckpoint(testCheckpoint);
        Start.prepareGameStart();
        Start.startReal();
      })
        .then(() => {
          TestPlayer.triggerServerLog(`Test playback started`, 'info');
          TestPlayer.startPlayback(0, this.logTest.bind(this));
          const feedback = cardConsoleContainer.querySelector('.test-feedback');
          feedback.classList.add('is--playing');
          feedback.classList.remove('has--success');
          feedback.classList.remove('has--errors');
        })
        .catch(e => {
          this.logTest(`Failed to load test data: ${e.message}`, 'error');
        });
    } catch (e) {
      this.logTest(`Failed to start playback: ${e.message}`, 'error');
    }
  },

  /**
   * Stop test playback
   */
  stopPlayback: function () {
    cardConsoleContainer.querySelector('.stop-playback').classList.add('is--hidden');
    cardConsoleContainer.querySelector('.start-recording').classList.remove('is--hidden');
    TestPlayer.stopPlayback();
    this.logTest('Test playback stopped', 'warning');
  },

  /**
   * Start test recording
   */
  startRecording: function () {
    cardConsoleContainer.querySelector('.start-recording').classList.add('is--hidden');
    cardConsoleContainer.querySelector('.stop-recording').classList.remove('is--hidden');
    this.clearTestFeedback();
    TestRecorder.startRecording(this.logTest.bind(this));
    this.logTest('Recording started', 'success');
  },

  /**
   * Stop test recording
   */
  stopRecording: function () {
    cardConsoleContainer.querySelector('.stop-recording').classList.add('is--hidden');
    cardConsoleContainer.querySelector('.start-recording').classList.remove('is--hidden');
    TestRecorder.stopRecording();
    const commands = TestRecorder.getRecordedCommands();
    this.logTest(`Recording stopped. Captured ${commands.length} commands`, 'success');
  },
};
