import Props from './props.js';
import Audio from './audio.js';
import Companion from './companion.js';
import Almanac from './almanac.js';
import Items from './items.js';
import { EventManager, EVENTS, PlayerManager, ShipManager } from './core/index.js';
import TimingUtils from './utils/timing-utils.js';

const mapHigh = document.querySelector('.map-high img');
const morningLight = document.querySelectorAll('.morning-light');
const eveningLight = document.querySelectorAll('.evening-light');
const nightLight = document.querySelectorAll('.night-light');
const nightCover = document.querySelectorAll('.night-ui-cover');

const inventoryContainer = document.getElementById('inventory');
const craftContainer = document.getElementById('craft');

export default {
  init: function () {
    document.body.addEventListener('mousedown', this.handleClick.bind(this));
    document.body.addEventListener('keydown', this.handleKeydown.bind(this));

    document.body.addEventListener('contextmenu', ev => {
      if (Props.getGameProp('local') === false) {
        ev.preventDefault();
      }
    });

    this.showQuitAppButtonIfExecutable();

    // Register event listeners
    EventManager.on(EVENTS.PLAYER_PROP_CHANGED, ({ prop, change, oldValue, newValue }) => {
      this.updatePropUI({ prop, change, oldValue, newValue });
    });

    EventManager.on(
      EVENTS.GAME_PROP_CHANGED,
      ({ prop, value }) => {
        if (prop === 'timeIsUnity') {
          this.handleTimeChange(value);
        }
      },
      { prop: 'timeIsUnity', value: Props.getGameProp('timeIsUnity') }
    );
  },

  showQuitAppButtonIfExecutable: function () {
    if (window.electronAPI?.isElectron) {
      document.getElementById('quit-app').classList.remove('is--hidden');
      document.getElementById('quit-app-start-menu').classList.remove('is--hidden');
    }
  },

  handleTimeChange: function (time) {
    const hour = time.todayHours;
    const days = time.gameDays;
    const ticksPerHour = Props.getGameProp('timeConfig').ticksPerHour;
    const totalHours = time.gameHours - 24; // it starts with 24h ahead :-(

    // Update game time UI elements
    document.getElementById('gametime-days').textContent = days;
    document.getElementById('gametime-hours').textContent = time.todayTime;
    const remainingHours = 9 * 24 - totalHours;
    const countdownEl = document.getElementById('gametime-countdown');
    const daysLeft = Math.floor(remainingHours / 24);
    countdownEl.textContent =
      daysLeft === 0
        ? `Only ${remainingHours} hours left`
        : `${daysLeft} days ${remainingHours % 24} hours left`;
    countdownEl.classList.toggle('critical', daysLeft === 0);

    // Check if it's a new hour (when gameTick is divisible by ticksPerHour)
    if (time.gameTick % ticksPerHour === 0) {
      this.updateDayNightLayers(hour);
      this.switchDayNight(hour);
      this.showNewDay(hour);
    }

    // Check if it's a new day (when gameHours is divisible by 24)
    if (time.gameHours % 24 === 0 && time.gameTick % ticksPerHour === 0) {
      this.dailyTasks(days);
    }
  },

  handleKeydown: function (ev) {
    const actionsPanel = document.getElementById('actions');
    const actionsPanelActive = actionsPanel.classList.contains('active');
    if (!Props.getGameProp('battle') && ev.key) {
      if (ev.key.toLowerCase() === 'i' && actionsPanelActive) {
        actionsPanel
          .querySelector('li.inventory')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      } else if (ev.key.toLowerCase() === 'c' && actionsPanelActive) {
        actionsPanel
          .querySelector('li.craft')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      } else if (ev.key.toLowerCase() === 'm') {
        if (actionsPanelActive) {
          actionsPanel
            .querySelector('li.map')
            ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
        } else {
          this.handleMapClick();
        }
      } else if (ev.key.toLowerCase() === 'e') {
        const settingsAction = actionsPanel.querySelector('li.settings');
        // make sure editor can be opened even if actions panel is hidden
        if (settingsAction) {
          settingsAction.dispatchEvent(new Event('mousedown', { bubbles: true }));
        } else {
          document.getElementById('card-console').classList.toggle('out');
        }
      } else if (ev.key.toLowerCase() === 'q' && actionsPanelActive) {
        actionsPanel
          .querySelector('li.quit')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      } else if (ev.key.toLowerCase() === 'f' && actionsPanelActive) {
        actionsPanel
          .querySelector('li.fullscreen')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      } else if ((ev.key.toLowerCase() === 'p' || ev.code === 'Space') && actionsPanelActive) {
        actionsPanel
          .querySelector('li.mixed span.pause')
          ?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      }
    }
    if (ev.key === 'Escape') {
      if (Props.getGameProp('startMode') === -1) {
        this.toggleInstantQuitConfirmation();
      }
    }
  },

  // just finds a class among a predefined set
  getActionType: function (element) {
    const classes = ['inventory', 'craft', 'mixed', 'settings', 'map', 'quit', 'fullscreen'];
    return classes.find(cls => element.classList.contains(cls));
  },

  handleClick: function (ev) {
    const target = ev.target;
    const clickAction = target.closest('#actions');
    const mapClick = target.closest('#maximap');
    const leftMouseButton = ev.button === 0 || !ev.button; // 2nd part also takes keyboard shortcuts into account

    if (clickAction && leftMouseButton && !Props.getGameProp('battle')) {
      Audio.sfx('click');
      ev.preventDefault();
      ev.stopPropagation();
      const action = target.closest('li');
      if (action) {
        const actionType = this.getActionType(action);
        switch (actionType) {
          case 'inventory':
            this.toggleInventory();
            break;
          case 'craft':
            this.toggleCrafting();
            break;
          case 'mixed':
            if (target.classList.contains('pause')) {
              if (Props.getGameProp('gamePaused')) {
                Props.pauseGame(false);
                target.innerHTML = '<u>P</u>ause Game';
                target.classList.remove('active');
              } else {
                Props.pauseGame(true);
                target.innerHTML = 'Game <u>P</u>aused';
                target.classList.add('active');
              }
            }
            break;
          case 'settings':
            document.getElementById('card-console').classList.toggle('out');
            break;
          case 'map':
            this.hideUI();
            break;
          case 'quit':
            this.hideUI();
            this.quitConfirmation();
            break;
          case 'fullscreen': {
            // enter/exit fullscreen mode
            const fullscreenActive = document.fullscreenElement;
            if (document.fullscreenEnabled && !Props.getGameProp('testPlayback')) {
              if (!fullscreenActive) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }
            break;
          }
        }
      }
    }

    if (mapClick) {
      this.handleMapClick();
    }

    if (target && target.classList.contains('card-tutorial-confirm')) {
      Audio.sfx('shuffle-paper');
      document.getElementById('tutorial-beginning').classList.add('is--hidden');
    }
  },

  toggleInventory: function () {
    const inventoryActive = inventoryContainer.classList.contains('active');
    if (inventoryActive) {
      this.closeInventory();
    } else {
      this.openInventory();
    }
  },

  openInventory: function () {
    inventoryContainer.classList.add('active');
    this.closeCrafting();
  },

  closeInventory: function () {
    inventoryContainer.classList.remove('active');
    if (Props.getGameProp('feedingCompanion')) {
      document.getElementById('inventory').classList.remove('feeding-companion');
      Companion.toggleCompanionFeedingState(false);
      Props.setGameProp('feedingCompanion', false);
      Props.setGameProp('inventoryAlternativeUse', false);
      Items.fillInventorySlots();
    } else if (Props.getGameProp('fuelingShip')) {
      document.getElementById('inventory').classList.remove('fueling-ship');
      Props.setGameProp('fuelingShip', false);
      Props.setGameProp('inventoryAlternativeUse', false);
      Items.fillInventorySlots();
    } else if (Props.getGameProp('waitingTime')) {
      document.getElementById('inventory').classList.remove('waiting-time');
      Props.setGameProp('waitingTime', false);
      Props.setGameProp('inventoryAlternativeUse', false);
      Items.fillInventorySlots();
    }
  },

  closeCrafting: function () {
    craftContainer.classList.remove('active');
  },

  showFeedingInventory: function () {
    Props.setGameProp('feedingCompanion', true);
    Props.setGameProp('inventoryAlternativeUse', true);
    Items.fillInventorySlots();
    this.openInventory();
    document.getElementById('inventory').classList.add('feeding-companion');
  },

  showFuelingShipInventory: function () {
    this.closeInventory();
    Props.setGameProp('fuelingShip', true);
    Props.setGameProp('inventoryAlternativeUse', true);
    Items.fillInventorySlots();
    this.openInventory();
    document.getElementById('inventory').classList.add('fueling-ship');
  },

  showWaitingTimeInventory: function () {
    this.closeInventory();
    Props.setGameProp('waitingTime', true);
    Props.setGameProp('inventoryAlternativeUse', true);
    Items.fillInventorySlots();
    this.openInventory();
    document.getElementById('inventory').classList.add('waiting-time');
  },

  toggleCrafting: function (forceOpen) {
    const craftingActive = craftContainer.classList.contains('active');
    if (craftingActive && !forceOpen) {
      this.closeCrafting();
    } else {
      craftContainer.classList.add('active');
      this.closeInventory();
    }
  },

  quitConfirmation: async function () {
    let startScreen = document.getElementById('startscreen');
    startScreen.classList.remove('is--hidden');
    startScreen.style.opacity = 0;
    await TimingUtils.wait(300);
    startScreen.querySelector('.screen__1').classList.add('is--hidden');
    startScreen.querySelector('.screen__2').classList.add('is--hidden');
    startScreen.querySelector('.screen__3').classList.add('is--hidden');
    startScreen.querySelector('.screen__dead').classList.add('is--hidden');
    startScreen.querySelector('.screen__win').classList.add('is--hidden');
    startScreen.querySelector('.screen__quit').classList.remove('is--hidden');
    startScreen.style.opacity = 1;
  },

  toggleInstantQuitConfirmation: async function () {
    let startScreen = document.getElementById('startscreen');
    if (startScreen.querySelector('.screen__quit').classList.contains('is--hidden')) {
      if (!document.getElementById('almanac').classList.contains('out')) {
        // 1. check for active almanac entry and close it if open
        Almanac.close(true);
        return;
      } else if (document.getElementById('inventory').classList.contains('active')) {
        // 2. check for open inventory and close it
        this.closeInventory();
        return;
      } else if (document.getElementById('craft').classList.contains('active')) {
        // 3. check for open crafting and close it
        this.closeCrafting();
        return;
      } else if (!document.getElementById('actions').classList.contains('active')) {
        // 4. check for hidden UI and bring it back if hidden
        this.showUI();
        return;
      }
      startScreen.classList.remove('is--hidden');
      startScreen.style.opacity = 1;
      startScreen.querySelector('.screen__quit').classList.remove('is--hidden');
      return;
    } else {
      startScreen.querySelector('.screen__quit').classList.add('is--hidden');
      startScreen.style.opacity = 0;
      startScreen.classList.add('is--hidden');
      this.showUI();
      return;
    }
  },

  handleMapClick: function () {
    this.closeCrafting();
    this.closeInventory();
    this.showUI();
  },

  hideUI: function () {
    this.closeCrafting();
    this.closeInventory();
    Almanac.close(true);
    document.getElementById('properties').classList.remove('active');
    document.getElementById('character').classList.remove('active');
    document.getElementById('actions').classList.remove('active');
    document.getElementById('cards').classList.remove('active');
    document.getElementById('almanac').classList.add('out');
    document.getElementById('card-console').classList.add('out');
  },

  showUI: function () {
    document.getElementById('properties').classList.add('active');
    document.getElementById('character').classList.add('active');
    document.getElementById('actions').classList.add('active');
    document.getElementById('cards').classList.add('active');
  },

  previewProps: function (prop, change) {
    const playerProps = PlayerManager.getPlayerProps();
    const previewMeter = document.querySelector(
      '#properties li.' + prop + ' span.meter:not(.preview)'
    );
    if (previewMeter) {
      if (change > 0) {
        playerProps[prop] + change > 100 ? (change = 100 - playerProps[prop]) : null;
        previewMeter.style.paddingRight = change + '%';
      } else if (change < 0) {
        if (previewMeter) {
          previewMeter.style.paddingRight =
            (playerProps[prop] + change >= 0 ? Math.abs(change) : playerProps[prop]) + '%';
          previewMeter.style.width =
            (playerProps[prop] + change >= 0 ? playerProps[prop] + change : 0) + '%';
        }
      }
      if (playerProps[prop] + change < 10) {
        previewMeter.parentNode.classList.add('very-low-preview');
      } else if (playerProps[prop] + change < 33) {
        previewMeter.parentNode.classList.add('low-preview');
      } else {
        previewMeter.parentNode.classList.add('default-preview');
      }
    }
  },

  previewShipProps: function (prop, change) {
    const previewMeter = document.querySelector(
      '#ship-properties li.' + prop + ' span.meter:not(.preview)'
    );
    const meterScale = prop === 'time' ? 2.5 : 1; // max waiting time is 250h, fuel is 100%
    const shipProps = ShipManager.getShipProps();
    if (change > 0) {
      (shipProps[prop] + change) / meterScale > 100
        ? (change = 100 * meterScale - shipProps[prop])
        : null;
      previewMeter.style.paddingRight = change / meterScale + '%';
    }
  },

  resetPreviewProps: function () {
    const properties = ['food', 'thirst', 'energy', 'health'];
    properties.forEach(prop => {
      const li = document.querySelector(`#properties li.${prop}`);
      li.classList.remove('transfer', 'low-preview', 'very-low-preview', 'default-preview');
      li.querySelector('span.meter').style.paddingRight = '0';
      /* make sure to render playerprops again, otherwise the meter will be misaligned for edge cases if (change < 0) */
      Props.changePlayerProp(prop, 0);
    });
    const shipProperties = ['fuel', 'time'];
    shipProperties.forEach(prop => {
      const li = document.querySelector(`#ship-properties li.${prop}`);
      li.classList.remove('transfer');
      li.querySelector('span.meter').style.paddingRight = '0';
    });
  },

  /**
   * Update UI in response to player property changes (event handler)
   * All UI updates for property changes happen here
   */
  updatePropUI: function ({ prop, change, newValue }) {
    // Update numeric value
    const propMeterValue = document.getElementById(`${prop}-meter`);
    if (propMeterValue) {
      propMeterValue.textContent = newValue;
    }
    // Update property meter
    const propMeter = document.querySelector(`#properties li.${prop} span.meter:not(.preview)`);
    if (propMeter) {
      propMeter.style.width = newValue > 9 ? newValue + '%' : '9%';
      propMeter.parentNode.classList.remove('low');
      propMeter.parentNode.classList.remove('very-low');

      if (newValue < 10) {
        propMeter.parentNode.classList.add('very-low');
      } else if (newValue < 33) {
        propMeter.parentNode.classList.add('low');
      }

      if (prop === 'health' && change < 0) {
        document.querySelector('#properties li.health').classList.add('heavy-shake');
        window.setTimeout(() => {
          document.querySelector('#properties li.health').classList.remove('heavy-shake');
        }, 200);
      }
    }

    // Update damage overlay for health changes
    if (prop === 'health') {
      this.updateDamageOverlay(newValue);
    }
  },

  updateDamageOverlay: function (health) {
    if (health < 33) {
      document.getElementById('damage-cover').style.opacity = (100 - health * 3.3) / 100;
    } else {
      document.getElementById('damage-cover').style.opacity = 0;
    }
  },

  hourlyTasks: function (hour) {
    this.updateDayNightLayers(hour);
    this.switchDayNight(hour);
    this.showNewDay(hour);
  },

  switchDayNight: function (hour) {
    if (hour === 21) {
      // switch to night time
      document.querySelector('#actions li.mixed').classList.remove('day');
      document.querySelector('#actions li.mixed').classList.add('night');
      Props.setGameProp('timeMode', 'night');
    }
    if (hour === 5) {
      // switch to day time
      document.querySelector('#actions li.mixed').classList.remove('night');
      document.querySelector('#actions li.mixed').classList.add('day');
      Props.setGameProp('timeMode', 'day');
    }
  },

  dailyTasks: function (days) {
    if (days > 9) {
      EventManager.emit(EVENTS.GAME_OVER);
    }
  },

  showNewDay: async function (hour, force) {
    const time = Props.getGameProp('timeIsUnity');
    if (force || (time.gameDays > Props.getGameProp('startDay') && hour === 7)) {
      const dayTeaser = document.getElementById('day-teaser');
      if (dayTeaser) {
        dayTeaser.querySelector('.content').innerHTML = 'Day <span>' + time.gameDays + '</span>';
        dayTeaser.classList.add('open');
        dayTeaser.style.zIndex = '60';
        await TimingUtils.wait(2500);
        dayTeaser.querySelector('.content').style.transitionDelay = '0';
        dayTeaser.classList.remove('open');
        await TimingUtils.wait(1000);
        dayTeaser.removeAttribute('style');
      }
    }
  },

  updateDayNightLayers: function (hour) {
    var shortShadowPos = 0;
    var shortShadowSize = 0;
    var longShadowPos = 0;
    var longShadowSize = 0;

    if (hour >= 5 && hour <= 19) {
      let timeTillNoon = (12 - hour) * -1;
      if (hour >= 5 && hour <= 9) {
        for (const light of morningLight) {
          light.style.opacity = 0.9 - (hour - 5) / 4;
        }
      } else if (hour >= 16 && hour <= 19) {
        for (const light of eveningLight) {
          light.style.opacity = (hour - 16) / 3;
        }
      }
      shortShadowPos = Math.round(timeTillNoon * 0.7);
      shortShadowSize = Math.round(timeTillNoon * 1);
      longShadowPos = Math.round(timeTillNoon * 4);
      longShadowSize = Math.round(timeTillNoon * 1.3);
      mapHigh.style.filter =
        'drop-shadow(' +
        shortShadowPos +
        'px ' +
        Math.abs(shortShadowPos / 2) +
        'px ' +
        Math.abs(shortShadowSize) +
        'px rgba(0, 0, 0, 0.5)) drop-shadow(' +
        longShadowPos +
        'px ' +
        Math.abs(longShadowPos / 2) +
        'px ' +
        Math.abs(longShadowSize) +
        'px rgba(0, 0, 0, 0.4))';
    }
    if (hour >= 20 && hour <= 22) {
      for (const light of nightLight) {
        light.style.opacity = 1 - Math.round(((23 - hour) / 2) * 10) / 10 + 0.3; // / 2 -> completely dark
      }
      for (const light of nightCover) {
        light.style.opacity = 1 - Math.round(((21 - hour) / 2) * 10) / 10; // / 2 -> completely dark
      }
    } else if (hour >= 4 && hour <= 7) {
      for (const light of nightLight) {
        light.style.opacity = 0.9 - Math.round(((hour - 4) / 3) * 10) / 10;
      }
      for (const light of nightCover) {
        light.style.opacity = 1 - Math.round(((hour - 4) / 3) * 10) / 10;
      }
    }
    if (hour === 23) {
      this.triggerNight();
    }
  },

  triggerNight: function () {
    mapHigh.style.filter = '';
    for (const light of morningLight) {
      light.style.opacity = 0;
    }
    for (const light of eveningLight) {
      light.style.opacity = 0;
    }
    for (const light of nightLight) {
      light.style.opacity = 0.8;
    }
    for (const light of nightCover) {
      light.style.opacity = 1;
    }
  },
};
