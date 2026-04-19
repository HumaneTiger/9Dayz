import Audio from './audio.js';
import Items from './items.js';
import Tutorial from './tutorial.js';
import Props from './props.js';
import BattleCardsMarkup from './battle-cards-markup.js';
import { BattleManager, CompanionManager, GameState } from './core/index.js';

const battleCardsContainer = document.getElementById('battle-cards');
const defensiveCardsContainer = document.querySelector('#defensive-cards');
const battleDrawContainer = document.querySelector('#battle-cards .draw');
const battlePlayContainer = document.querySelector('#battle-cards .play');
const battleCompanionContainer = document.querySelector('#companion-cards');
const battleHealthMeter = document.querySelector('#properties li.health');
const scratch = document.querySelector('.scratch');

let newPosX = 0,
  newPosY = 0,
  startPosX = 0,
  startPosY = 0,
  initialStyleLeft = 0,
  initialStyleTop = 0;
let dragMode = false;
let dragEl = null;
let topIndex = 1;

export default {
  battleController: null,

  init: function () {
    document.body.addEventListener('mouseover', this.mouseOver);
    document.body.addEventListener('pointerdown', this.mouseDown);
    document.body.addEventListener('pointermove', this.mouseMove.bind(this));
    document.body.addEventListener('pointerup', this.mouseUp.bind(this));
    battleCardsContainer.addEventListener('mousedown', this.handleBattleCardsClick);
    document.addEventListener('uiDragTestEvent', this.handleUiTestDragEvent.bind(this));
  },

  setBattleController: function (battle) {
    this.battleController = battle;
  },

  handleBattleCardsClick: function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const leftMouseButton = ev.button === 0;
    const target = ev.target;
    if (!(leftMouseButton && target && Props.getGameProp('battle'))) {
      return;
    }
    if (target.closest('.end-turn')) {
      this.battleController.endTurn();
    } else if (target.closest('.start-tutorial')) {
      Tutorial.triggerBattleTutorial();
    }
  },

  mouseOver: function (ev) {
    if (!Props.getGameProp('battle')) {
      return;
    }
    const target = ev.target;
    const battleCard = target.closest ? target.closest('div.battle-card') : null,
      item = battleCard?.dataset.item;
    if (dragMode === false && battleCard) {
      battleCardsContainer.querySelector('p.item-info').innerHTML = Items.getItemInfoMarkup(
        item,
        true
      );
    } else {
      battleCardsContainer.querySelector('p.item-info').innerHTML = '';
    }
  },

  mouseDown: function (ev) {
    let target = ev.target;
    const leftMouseButton = ev.button === 0;

    if (!(leftMouseButton && target && Props.getGameProp('battle'))) {
      return;
    }

    if (dragMode === false && target.closest('div.battle-card')) {
      dragMode = true;

      dragEl = target.closest('div.battle-card');

      dragEl.style.zIndex = topIndex++;
      dragEl.classList.add('grabbed');

      startPosX = dragEl.clientX;
      startPosY = dragEl.clientY;

      initialStyleLeft = dragEl.style.left;
      initialStyleTop = dragEl.style.top;
    }
  },

  mouseMove: function (e) {
    e.preventDefault;
    e.stopPropagation();
    if (!(dragMode && Props.getGameProp('battle'))) {
      return;
    }
    const scale = Props.getGameProp('scaleFactor');
    // calculate the new position
    newPosX = (startPosX - e.clientX) / scale;
    newPosY = (startPosY - e.clientY) / scale;

    // with each move we also want to update the start X and Y
    startPosX = e.clientX;
    startPosY = e.clientY;

    if (dragEl) {
      // set the element's new position:
      dragEl.style.top = dragEl.offsetTop - newPosY + 'px';
      dragEl.style.left = dragEl.offsetLeft - newPosX + 'px';
      let dragTarget = this.getDragTarget(e);
      if (dragTarget) {
        dragTarget.classList.add('active');
      }
      // remove item info when card is dragged
      battleCardsContainer.querySelector('p.item-info').innerHTML = '';
    }
  },

  mouseUp: function (e) {
    if (!(dragMode && Props.getGameProp('battle'))) {
      return;
    }
    let dragTarget = this.getDragTarget(e);
    this.resolveMouseUp(dragTarget, dragEl);
    dragMode = false;
    dragEl = null;
  },

  handleUiTestDragEvent: function (e) {
    const { dragTarget, dragItem, dragIndex } = e.detail;
    // Handle the test drag event directly
    const dragTargetEl = document.querySelector(`[id="${dragTarget}"]`);
    const dragEl = document.querySelector(
      `#battle-cards [data-item="${dragItem}"][data-index="${dragIndex}"]`
    );
    if (dragTargetEl && dragEl) {
      this.resolveMouseUp(dragTargetEl, dragEl);
    }
  },

  async resolveMouseUp(dragTarget, dragEl) {
    if (dragTarget && dragEl) {
      if (dragTarget.classList.contains('zombie') && !dragEl.classList.contains('resolve')) {
        const itemName = dragEl.dataset.item;
        if (itemName === 'improvised-whip') {
          await this.battleController.resolveMultiAttack(dragEl, dragTarget);
        } else {
          this.battleController.resolveSingleAttack(dragEl, dragTarget);
        }
      }
    } else if (dragEl) {
      this.resetDraggedElement(dragEl);
    }
  },

  resetDraggedElement: function (el) {
    el.style.left = initialStyleLeft;
    el.style.top = initialStyleTop;
    el.classList.remove('grabbed');
  },

  getDragElement: function () {
    return dragEl;
  },

  /* todo: use this one for normal battles as well */
  playAttackAnim: function (attackerCardRef, targetObjectRef, attackSoundId, reverse) {
    return new Promise(resolve => {
      attackerCardRef.classList.add('attacking');
      const animPunchClassName = reverse ? 'anim-punch-reverse' : 'anim-punch';
      window.setTimeout(() => {
        attackerCardRef.classList.add(animPunchClassName);
        Audio.sfx(attackSoundId);
        window.setTimeout(() => {
          targetObjectRef.classList.add('heavy-shake');
          this.scratchAnim(targetObjectRef);
          resolve(); // Attack finished
        }, 200);
        window.setTimeout(() => {
          targetObjectRef.classList.remove('heavy-shake');
          attackerCardRef.classList.remove(animPunchClassName);
          attackerCardRef.classList.remove('attacking');
        }, 500);
      }, 400);
    });
  },

  playZedAttackAnim: function (zedCardRef, zedName) {
    zedCardRef.classList.add('anim-punch');
    this.shakeHealthMeter(false);
    this.shakeDefensiveCards(false);
    if (zedName === 'rat') {
      Audio.sfx('rat-attacks');
    } else if (zedName === 'bee') {
      Audio.sfx('bee-attacks');
    } else {
      Audio.sfx('zed-attacks');
    }
  },

  scratchAnim: function (targetObjectRef) {
    var rect = targetObjectRef.getBoundingClientRect();
    scratch.style.left = `${rect.left}px`;
    scratch.style.top = `${rect.top + 180}px`;
    scratch.classList.add('anim-scratch');
    window.setTimeout(() => {
      scratch.classList.remove('anim-scratch');
    }, 250);
  },

  runHitAnimation: function (dragEl, zedCardRef) {
    Audio.sfx('punch');
    // run "hit" animation
    this.scratchAnim(zedCardRef);
    zedCardRef.classList.add('card-heavy-shake');
    // resolve item card
    dragEl.classList.add('resolve');

    // cleanup
    window.setTimeout(
      (dragEl, zedCardRef) => {
        dragEl.remove();
        zedCardRef.classList.remove('card-heavy-shake');
      },
      200,
      dragEl,
      zedCardRef
    );
  },

  enterUIBattleMode(defaultBattle) {
    // Prepare UI for battle
    document.getElementById('inventory').classList.remove('active');
    document.getElementById('craft').classList.remove('active');
    document.getElementById('character').classList.remove('active');
    document.getElementById('cards').classList.add('battle-mode');
    document.querySelector('#cards .cards-blocker').classList.remove('is--hidden');
    defensiveCardsContainer.classList.remove('heavy-shake');
    defensiveCardsContainer.classList.remove('is--hidden');

    // Time further changes to allow CSS transitions
    window.setTimeout(() => {
      document.querySelector('#cards .cards-blocker').classList.add('active');
    }, 100);

    window.setTimeout(() => {
      document.getElementById('properties').classList.remove('active');
      document.getElementById('actions').classList.remove('active');
      document.querySelector('#cards .cards-blocker').classList.add('active');
      defensiveCardsContainer.classList.add('in-battle');
      if (defaultBattle) battleHealthMeter.classList.add('in-battle');
    }, 600);
  },

  leaveUIBattleMode() {
    // Clear battle UI
    document.getElementById('battle-cards').classList.add('is--hidden');
    battleCompanionContainer.classList.add('is--hidden');
    defensiveCardsContainer.innerHTML = '';
    defensiveCardsContainer.classList.remove('in-battle');
    defensiveCardsContainer.classList.add('is--hidden');

    battleDrawContainer.innerHTML = '';
    battlePlayContainer.innerHTML = '';
    battleCompanionContainer.innerHTML = '';

    document.getElementById('draw-amount').style.left = '0';
    battleDrawContainer.style.width = '';

    // Show UI
    battleHealthMeter.classList.remove('in-battle');
    document.getElementById('properties').classList.add('active');
    document.getElementById('actions').classList.add('active');
    document.getElementById('character').classList.add('active');
    document.getElementById('cards').classList.remove('battle-mode');
    document.querySelector('#cards .cards-blocker').classList.remove('active');
  },

  shakeHealthMeter: function (shake) {
    if (shake) {
      battleHealthMeter.classList.add('heavy-shake');
    } else {
      battleHealthMeter.classList.remove('heavy-shake');
    }
  },

  showBattleMessage: function (message, delay) {
    document.querySelector('#battle-message').innerHTML = message;
    document.querySelector('#battle-message').classList.add('active');
    window.setTimeout(() => {
      document.querySelector('#battle-message').classList.remove('active');
    }, delay);
  },

  showBattleStats: function (stat, type) {
    const battleStats = document.querySelector('#battle-stats span.' + type);
    if (type === 'image') {
      battleStats.innerHTML = '<img width="60" height="auto" src="./img/items/' + stat + '.PNG">';
    } else {
      battleStats.innerHTML = stat;
    }
    battleStats.classList.add('active');
    window.setTimeout(
      battleStats => {
        battleStats.classList.remove('active');
      },
      500,
      battleStats
    );
  },

  getDragTarget: function (e) {
    let targetCandidateFound;
    let mouseX = e.clientX;
    let mouseY = e.clientY;

    let targetCards = document.querySelectorAll('.card.zombie.fight');

    targetCards.forEach(candidate => {
      let viewportOffset = candidate.getBoundingClientRect();
      candidate.classList.remove('active');

      if (
        mouseX >= viewportOffset.left &&
        mouseX <= viewportOffset.right &&
        mouseY >= viewportOffset.top &&
        mouseY <= viewportOffset.bottom
      ) {
        targetCandidateFound = candidate;
      }
    });

    return targetCandidateFound;
  },

  renderDrawPile: function (remainingCards) {
    const totalCards =
      remainingCards !== undefined ? remainingCards : BattleManager.getBattleDeckSize();
    document.getElementById('draw-amount').textContent = totalCards;

    const pileSize = Math.min(
      BattleManager.getBattleDeckSize(),
      BattleManager.getMaxDrawPileSize()
    );

    const allDrawPileCards = this.getAllDrawPileCards();

    for (let card = 0; card < pileSize; card += 1) {
      if (card < totalCards) {
        allDrawPileCards[card].classList.remove('is--hidden');
      } else {
        allDrawPileCards[card].classList.add('is--hidden');
      }
    }
    document.getElementById('draw-amount').style.left =
      172 + Math.min(totalCards, BattleManager.getMaxDrawPileSize()) * 4 + 'px';
    if (totalCards === 0) {
      document.getElementById('draw-amount').classList.add('is--hidden');
    } else {
      document.getElementById('draw-amount').classList.remove('is--hidden');
    }
    this.showDrawPileCards(pileSize);
  },

  renderBattleCardDeck: function () {
    for (let i = 0; i < battlePlayContainer.children.length; i += 1) {
      window.setTimeout(
        (index, child, totalCards) => {
          child.style.left = index * 170 + 'px';
          child.classList.remove('inactive');
          child.dataset.index = index;
          this.renderDrawPile(totalCards + index);
        },
        500 + i * 300,
        battlePlayContainer.children.length - i - 1,
        battlePlayContainer.children[i],
        BattleManager.getBattleDeckSize() - battlePlayContainer.children.length
      );
    }
  },

  setAllBattleCardsInactive: function () {
    const allBattleCards = battlePlayContainer.querySelectorAll('.battle-card');
    if (allBattleCards) {
      allBattleCards.forEach(battleCard => {
        battleCard.classList.add('inactive');
      });
    }
  },

  generateBattleCard: function (itemName) {
    const card = BattleManager.getBattleDeckCard(itemName);
    const modifyDamageMarkup =
      card?.modifyDamage && card.modifyDamage > 0
        ? '<span class="modify">(+' + card.modifyDamage + ')<span>'
        : '';

    const durabilityMarkup = BattleCardsMarkup.getDurabilityMarkup(itemName);
    const pictureMarkup = BattleCardsMarkup.getPictureMarkup(itemName);
    const lastUseMarkup = BattleCardsMarkup.getLastUseMarkup(itemName);

    battlePlayContainer.insertAdjacentHTML(
      'beforeend',
      '<div class="battle-card inactive" data-item="' +
        itemName +
        '"><div class="inner">' +
        pictureMarkup +
        lastUseMarkup +
        '<div class="attack">' +
        (card.damage + card.modifyDamage) +
        modifyDamageMarkup +
        '</div><div class="shield">' +
        card.protection +
        '</div>' +
        durabilityMarkup +
        '</div></div>'
    );
  },

  generateCompanionCard: function () {
    const companion = CompanionManager.getCompanionFromInventory();
    const healthMarkup = CompanionManager.generateHealthMarkup();
    battleCompanionContainer.insertAdjacentHTML(
      'beforeend',
      '<div class="battle-card" data-item="' +
        companion.name +
        '"><div class="inner">' +
        '<img class="item-pic" src="./img/animals/' +
        companion.name.toLowerCase() +
        '.png">' +
        '<div class="dead"><img src="./img/zombies/dead.png"></div>' +
        '<div class="attack">' +
        companion.damage +
        '</div>' +
        '<span class="durability">' +
        healthMarkup +
        '</span>' +
        '</div></div>'
    );

    battleCompanionContainer.classList.remove('is--hidden');
  },

  generateDrawPile: function (pileSize) {
    /* generate draw pile */
    for (let card = 0; card < pileSize; card += 1) {
      battleDrawContainer.insertAdjacentHTML(
        'beforeend',
        '<div class="battle-card-back is--hidden" style="left: ' + card * 4 + 'px"></div>'
      );
    }
  },

  getAllDrawPileCards() {
    return battleDrawContainer.querySelectorAll('.battle-card-back');
  },

  showDrawPileCards(pileSize) {
    battleDrawContainer.style.width = 160 + pileSize * 4 + 'px';
  },

  shakeDefensiveCards: function (shake) {
    if (shake) {
      defensiveCardsContainer.classList.add('heavy-shake');
    } else {
      defensiveCardsContainer.classList.remove('heavy-shake');
    }
  },

  generateDefensiveCard: function (defensiveObject, offsetX = 0) {
    const durabilityMarkup = BattleCardsMarkup.createDurabilityMarkup(
      defensiveObject.name,
      defensiveObject.durability || 0
    );
    const cardMarkup =
      '<div style="margin-left: ' +
      offsetX +
      'px;" class="battle-card" data-item="' +
      defensiveObject.name +
      '"><div class="inner">' +
      '<img class="item-pic" src="./img/weapons/' +
      defensiveObject.name.toLowerCase() +
      '.png">' +
      '<div class="attack">' +
      defensiveObject.attack +
      '</div><div class="shield">' +
      defensiveObject.defense +
      '</div>' +
      durabilityMarkup +
      '</div></div>';
    defensiveCardsContainer.insertAdjacentHTML('beforeend', cardMarkup);
  },

  emptyDefensiveCardsContainer: function () {
    defensiveCardsContainer.innerHTML = '';
  },

  updateDefensiveCardsContainer: function () {
    const defensiveDeck = BattleManager.getDefensiveDeck();
    if (!defensiveDeck || defensiveDeck.length === 0) {
      return;
    }
    this.emptyDefensiveCardsContainer();
    for (var i = defensiveDeck.length; i > 0; i -= 1) {
      const defensiveObject = Props.getObject(defensiveDeck[i - 1]);
      if (defensiveObject.durability > 0) {
        this.generateDefensiveCard(defensiveObject, (i - 1) * 15);
      }
    }
  },

  spawnCompanionDeck: function () {
    this.emptyBattlePlayContainer();
    this.generateCompanionCard();
  },

  spawnBattleDeck: function (surprised, battleDeck, sparedItems, onSurprised, onNormal) {
    if (sparedItems > 0) {
      this.showBattleMessage(
        `${GameState.getGameProp('character')} spares ${sparedItems} items`,
        2000
      );
    }
    this.generateDrawPile(Math.min(battleDeck.length, BattleManager.getMaxDrawPileSize()));

    /* render draw pile */
    this.renderDrawPile();
    if (surprised) {
      document.querySelector('#battle-cards .end-turn').classList.add('is--hidden');
      document.getElementById('battle-cards').classList.remove('is--hidden');
      this.showBattleMessage('Oh no! You walked into them!', 2000);
      window.setTimeout(() => {
        onSurprised();
      }, 600);
    } else {
      onNormal();
    }
  },

  emptyBattlePlayContainer: function () {
    battlePlayContainer.innerHTML = '';
  },
};
