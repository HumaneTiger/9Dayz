import Audio from './audio.js';
import Props from './props.js';
import Player from './player.js';
import Cards from './cards.js';
import CardsMarkup from './cards-markup.js';
import ActionsOrchestration from './actions-orchestration.js';
import Items from './items.js';
import Crafting from './crafting.js';
import Companion from './companion.js';
import Weapons from './weapons.js';
import RngUtils from './utils/rng-utils.js';
import Tutorial from './tutorial.js';
import {
  CardsManager,
  WeaponsManager,
  CompanionManager,
  ObjectState,
  GameState,
} from './core/index.js';
import TimingUtils from './utils/timing-utils.js';

const battleDrawContainer = document.querySelector('#battle-cards .draw');
const battlePlayContainer = document.querySelector('#battle-cards .play');
const battleCompanionContainer = document.querySelector('#companion-cards');
const battleHealthMeter = document.querySelector('#properties li.health');
const scratch = document.querySelector('.scratch');

//let cardZedDeck = [];
let allDrawPileCards = [];

export default {
  prepareBattle: function () {
    Props.setGameProp('battle', true);
    Props.pauseGame(true);
  },

  shuffle: function (array) {
    let currentIndex = array.length,
      randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      const battleRNG = RngUtils.battleRNG.random();
      randomIndex = Math.floor(battleRNG * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
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

  scratchAnim: function (targetObjectRef) {
    var rect = targetObjectRef.getBoundingClientRect();
    scratch.style.left = `${rect.left}px`;
    scratch.style.top = `${rect.top + 180}px`;
    scratch.classList.add('anim-scratch');
    window.setTimeout(() => {
      scratch.classList.remove('anim-scratch');
    }, 250);
  },

  startCompanionBattle(singleZedId) {
    if (!singleZedId) {
      return;
    }
    this.prepareBattle();
    const cardZedDeck = CardsManager.addIdToOpponentDeck(singleZedId);
    this.spawnZedDeck(cardZedDeck);
    this.enterUIBattleMode();
    // start auto battle after short delay
    window.setTimeout(() => {
      this.spawnCompanionDeck();
      const enemyObject = Props.getObject(singleZedId);
      const companion = CompanionManager.getCompanionFromInventory();
      if (enemyObject.name === 'rat' || enemyObject.name === 'bee') {
        this.startAutoBattleEnemyFirst(
          Cards.getCardById(singleZedId),
          document.querySelector('#companion-cards .battle-card'),
          enemyObject,
          companion
        );
      } else {
        this.startAutoBattleCompanionFirst(
          Cards.getCardById(singleZedId),
          document.querySelector('#companion-cards .battle-card'),
          enemyObject,
          companion
        );
      }
    }, 600);
  },

  resolveAutoBattle: function (enemyRef, companionRef, enemyObject, companion) {
    if (enemyObject.defense <= 0) {
      // enemy is dead
      enemyRef.classList.add('dead');
      enemyObject.dead = true;
      enemyObject.fighting = false;
      window.setTimeout(() => {
        Companion.updateCompanionSlot();
        this.endBattle();
      }, 880);
      return true;
    } else if (companion.health <= 0) {
      // companion is dead
      const healthMarkup = CompanionManager.generateHealthMarkup();
      companionRef.querySelector('.durability').innerHTML = healthMarkup;
      companionRef.classList.add('dead');
      companion.dead = true;
      window.setTimeout(async () => {
        Companion.updateCompanionSlot();
        this.endBattle();
      }, 800);
      return true;
    } else {
      return false;
    }
  },

  startAutoBattleCompanionFirst(enemyRef, companionRef, enemyObject, companion) {
    window.setTimeout(async () => {
      await this.playAttackAnim(companionRef, enemyRef, 'aggro-bark', true);
      enemyObject.defense -= companion.damage;
      if (!this.resolveAutoBattle(enemyRef, companionRef, enemyObject, companion)) {
        enemyRef.querySelector('.health').textContent = enemyObject.defense;
        window.setTimeout(async () => {
          await this.playAttackAnim(enemyRef, companionRef, 'zed-attacks', false);
          companion.health -= enemyObject.attack;
          if (!this.resolveAutoBattle(enemyRef, companionRef, enemyObject, companion)) {
            const healthMarkup = CompanionManager.generateHealthMarkup();
            companionRef.querySelector('.durability').innerHTML = healthMarkup;
            window.setTimeout(() => {
              this.startAutoBattleCompanionFirst(enemyRef, companionRef, enemyObject, companion);
            }, 880);
          }
        }, 1800);
      }
    }, 500);
  },

  startAutoBattleEnemyFirst(enemyRef, companionRef, enemyObject, companion) {
    window.setTimeout(async () => {
      await this.playAttackAnim(enemyRef, companionRef, 'zed-attacks', false);
      companion.health -= enemyObject.attack;
      if (!this.resolveAutoBattle(enemyRef, companionRef, enemyObject, companion)) {
        const healthMarkup = CompanionManager.generateHealthMarkup();
        companionRef.querySelector('.durability').innerHTML = healthMarkup;
        window.setTimeout(async () => {
          await this.playAttackAnim(companionRef, enemyRef, 'aggro-bark', true);
          enemyObject.defense -= companion.damage;
          if (!this.resolveAutoBattle(enemyRef, companionRef, enemyObject, companion)) {
            enemyRef.querySelector('.health').textContent = enemyObject.defense;
            window.setTimeout(() => {
              this.startAutoBattleEnemyFirst(enemyRef, companionRef, enemyObject, companion);
            }, 880);
          }
        }, 1800);
      }
    }, 500);
  },

  spawnZedDeck(cardZedDeck) {
    if (!cardZedDeck || cardZedDeck.length === 0) {
      return;
    }
    // position zed cards in the middle of the screen
    const spaceX = 400 - cardZedDeck.length * 15;
    cardZedDeck.forEach(function (zedId, index) {
      let zedCardRef = Cards.getCardById(zedId);
      const zedObject = Props.getObject(zedId);
      zedObject.fighting = true;
      zedObject.active = true;
      zedCardRef.classList.add('fight');
      zedCardRef.style.transform = '';
      zedCardRef.style.zIndex = null;
      zedCardRef.style.left = 2135 / 2 - (cardZedDeck.length * spaceX) / 2 + index * spaceX + 'px';
    });
  },

  enterUIBattleMode() {
    // Prepare UI for battle
    document.getElementById('inventory').classList.remove('active');
    document.getElementById('craft').classList.remove('active');
    document.getElementById('character').classList.remove('active');
    Weapons.updateWeaponState();
    document.getElementById('cards').classList.add('battle-mode');
    document.querySelector('#cards .cards-blocker').classList.remove('is--hidden');

    Player.resetPreviewProps();

    // Time further changes to allow CSS transitions
    window.setTimeout(() => {
      document.querySelector('#cards .cards-blocker').classList.add('active');
    }, 100);

    window.setTimeout(() => {
      document.getElementById('properties').classList.remove('active');
      document.getElementById('actions').classList.remove('active');
      document.querySelector('#cards .cards-blocker').classList.add('active');
    }, 600);
  },

  includeBarricade: function () {
    /* crafted objects get placed at players position, so player should be the reference position */
    const playerPosition = GameState.getGameProp('playerPosition');
    const allFoundObjectIds = ObjectState.findAllObjectsNearby(playerPosition.x, playerPosition.y);
    const barricadesOnly = allFoundObjectIds.filter(
      singleObject => Props.getObject(singleObject).name === 'barricades'
    );
    if (barricadesOnly.length > 0) {
      //BattleManager.includeBarricadeInBattle(barricadesOnly[0]);
      /* add dedicated "battle card" with title and durability */
      /* blue icon for 4 protection */
      /* add 4 protection by default each turn as long as card is present */
      /* has 10 durability when it spawns to make it worth it */
    }
  },

  startBattle(surprised, singleZedId) {
    this.prepareBattle();
    // singleZedId is the result of successful luring
    let cardZedDeck = singleZedId
      ? CardsManager.addIdToOpponentDeck(singleZedId)
      : CardsManager.addAllZedsNearby();
    if (cardZedDeck.length > 0) {
      this.spawnZedDeck(cardZedDeck);
      this.enterUIBattleMode();
      this.includeBarricade();
      window.setTimeout(() => {
        this.spawnBattleDeck(surprised);
      }, 600);
    } else {
      this.endBattle();
    }

    if (!Props.getGameProp('firstFight') && Props.getGameProp('tutorial')) {
      Props.setGameProp('firstFight', true);
      Tutorial.triggerBattleTutorial();
    }
  },

  renderDrawPile: function (remainingCards) {
    const totalCards =
      remainingCards !== undefined ? remainingCards : CardsManager.getBattleDeckSize();
    document.getElementById('draw-amount').textContent = totalCards;

    const pileSize = Math.min(CardsManager.getBattleDeckSize(), 24);
    for (let card = 0; card < pileSize; card += 1) {
      if (card < totalCards) {
        allDrawPileCards[card].classList.remove('is--hidden');
      } else {
        allDrawPileCards[card].classList.add('is--hidden');
      }
    }
    document.getElementById('draw-amount').style.left = 200 + Math.min(totalCards, 24) * 4 + 'px';
    if (totalCards === 0) {
      document.getElementById('draw-amount').classList.add('is--hidden');
    } else {
      document.getElementById('draw-amount').classList.remove('is--hidden');
    }
    battleDrawContainer.style.width = 160 + pileSize * 4 + 'px';
  },

  spawnCompanionDeck: function () {
    const companion = CompanionManager.getCompanionFromInventory();
    battlePlayContainer.innerHTML = '';
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

  spawnBattleDeck: function (surprised) {
    const sparedItems = CardsManager.generateBattleDeck();
    const battleDeck = CardsManager.getBattleDeck();
    if (sparedItems > 0) {
      this.showBattleMessage(
        `${GameState.getGameProp('character')} spares ${sparedItems} items`,
        2000
      );
    }
    /* generate draw pile */
    for (let card = 0; card < Math.min(battleDeck.length, 24); card += 1) {
      battleDrawContainer.insertAdjacentHTML(
        'beforeend',
        '<div class="battle-card-back is--hidden" style="left: ' + card * 4 + 'px"></div>'
      );
    }
    allDrawPileCards = battleDrawContainer.querySelectorAll('.battle-card-back');
    /* render draw pile */
    this.renderDrawPile();
    battleHealthMeter.classList.add('in-battle');
    if (surprised) {
      document.querySelector('#battle-cards .end-turn').classList.add('is--hidden');
      document.getElementById('battle-cards').classList.remove('is--hidden');
      this.showBattleMessage('Oh no! You walked into them!', 2000);
      window.setTimeout(() => {
        this.zedAttack();
      }, 600);
    } else {
      this.nextTurn();
    }
  },

  leaveUIBattleMode() {
    return new Promise(resolve => {
      // Hide Battle UI
      document.getElementById('battle-cards').classList.add('is--hidden');
      battleCompanionContainer.classList.add('is--hidden');

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

      window.setTimeout(() => {
        document.querySelector('#cards .cards-blocker').classList.add('is--hidden');
        Props.setGameProp('battle', false);
        Crafting.checkCraftingPrerequisits();
        Player.updatePlayer();
        Weapons.updateWeaponState();
        Player.lockMovement(false);
        Props.pauseGame(false);
        resolve();
      }, 100);
    });
  },

  endBattle: async function () {
    CardsManager.removeBattleDeck();
    const cardZedDeck = CardsManager.getOpponentDeck();
    Companion.updateCompanionSlot();
    await this.leaveUIBattleMode();
    cardZedDeck.forEach(function (zedId) {
      let zedCardRef = Cards.getCardById(zedId);
      const zedObject = Props.getObject(zedId);
      zedObject.fighting = false;
      zedCardRef.classList.remove('fight');
      if (zedObject.dead) {
        Cards.removeAction('lure', zedCardRef, zedObject);
        Cards.removeAction('attack', zedCardRef, zedObject);
        Cards.removeAction('chomp', zedCardRef, zedObject);
        Cards.revealAction('search', zedCardRef, zedObject);
      }
      CardsMarkup.hideActionFeedback(zedCardRef);
    });
    ActionsOrchestration.endAction(cardZedDeck[0]);
    ActionsOrchestration.goBackFromAction();
    CardsManager.removeOpponentDeck();
  },

  nextTurn: function () {
    Props.changePlayerProp('protection', -100);
    Props.changePlayerProp('actions', -100);
    Props.changePlayerProp('actions', 3);

    document.querySelector('#action-points-warning .very-low')?.classList.add('is--hidden');
    document.querySelector('#action-points-warning .low')?.classList.add('is--hidden');
    document.querySelector('#action-points')?.classList.remove('low-energy');
    // AP buffs when energy is low
    if (Player.getProp('energy') < 10) {
      Props.changePlayerProp('actions', -2);
      document.querySelector('#action-points-warning .very-low')?.classList.remove('is--hidden');
      document.querySelector('#action-points')?.classList.add('low-energy');
    } else if (Player.getProp('energy') < 33) {
      Props.changePlayerProp('actions', -1);
      document.querySelector('#action-points-warning .low')?.classList.remove('is--hidden');
      document.querySelector('#action-points')?.classList.add('low-energy');
    }

    const battleDeck = CardsManager.getBattleDeck();

    // shuffle deck here, this is super important, do not do it later
    // otherwise the drawn cards are not deterministic
    this.shuffle(battleDeck);

    // draw up to 5 cards
    // split deck into 2 parts, weapons and others
    let weaponsDeck = battleDeck.filter(
      item => Props.isWeapon(item.name) || CompanionManager.isCompanion(item.name)
    );
    let itemsDeck = battleDeck.filter(
      item => !Props.isWeapon(item.name) && !CompanionManager.isCompanion(item.name)
    );
    battlePlayContainer.innerHTML = '';
    let maxItems = 5 - weaponsDeck.length;
    if (itemsDeck.length < maxItems) maxItems = itemsDeck.length;
    if (maxItems + weaponsDeck.length > 0) {
      document.querySelector('#battle-cards .end-turn').classList.remove('is--hidden');
      for (let i = 0; i < maxItems; i += 1) {
        this.addCardToPlay(itemsDeck[i].name);
      }
      for (let i = 0; i < weaponsDeck.length; i += 1) {
        this.addCardToPlay(weaponsDeck[i].name);
      }
      document.getElementById('battle-cards').classList.remove('is--hidden');
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
          battleDeck.length - battlePlayContainer.children.length
        );
      }
    } else {
      this.endTurn();
    }
  },

  getDurabilityMarkup: function (itemName) {
    if (Props.isWeapon(itemName)) {
      const weapon = WeaponsManager.getWeaponFromInventory(itemName);
      if (weapon.durability && weapon.durability > 0) {
        const maxDurabilityChars = '◈'.repeat(weapon.durability);
        return (
          '<span class="durability">' +
          maxDurabilityChars.substring(0, weapon.durability) +
          '<u>' +
          maxDurabilityChars.substring(0, maxDurabilityChars.length - weapon.durability) +
          '</u>' +
          '</span>'
        );
      }
    }
    if (CompanionManager.isCompanion(itemName)) {
      const healthMarkup = CompanionManager.generateHealthMarkup();
      return '<span class="durability">' + healthMarkup + '</span>';
    }
    return '';
  },

  getPictureMarkup: function (itemName) {
    if (Props.isWeapon(itemName)) {
      return '<img class="item-pic" src="./img/weapons/' + itemName + '.png">';
    }
    if (CompanionManager.isCompanion(itemName)) {
      return '<img class="item-pic" src="./img/animals/' + itemName + '-portrait.png">';
    }
    return '<img class="item-pic" src="./img/items/' + itemName + '.PNG">';
  },

  getLastUseMarkup: function (itemName) {
    if (Props.isWeapon(itemName)) {
      /* get weapon from inventory as it contains the actual durability */
      const weapon = WeaponsManager.getWeaponFromInventory(itemName);
      return weapon.durability === 1
        ? '<img class="last-use" src="./img/weapons/last-use.png">'
        : '';
    }
    if (CompanionManager.isCompanion(itemName)) {
      const companion = CompanionManager.getCompanionFromInventory();
      return companion.health <= 3
        ? '<img class="last-use" src="./img/animals/almost-dead.png">'
        : '';
    }
    return '';
  },

  addCardToPlay: function (itemName) {
    const card = CardsManager.getBattleDeckCard(itemName);
    const modifyDamageMarkup =
      card.modifyDamage > 0 ? '<span class="modify">(+' + card.modifyDamage + ')<span>' : '';
    const durabilityMarkup = this.getDurabilityMarkup(itemName);
    const pictureMarkup = this.getPictureMarkup(itemName);
    const lastUseMarkup = this.getLastUseMarkup(itemName);

    battlePlayContainer.insertAdjacentHTML(
      'beforeend',
      '<div class="battle-card inactive" data-item="' +
        card.name +
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

  resolveSingleAttack: function (dragEl, dragTarget) {
    const dragItemName = dragEl.dataset.item;
    const battleCard = CardsManager.getBattleDeckCard(dragItemName);
    Props.changePlayerProp('protection', battleCard.protection);
    Props.changePlayerProp('actions', -1);
    this.resolveAttack(dragItemName, dragTarget);
    this.runHitAnimation(dragEl, dragTarget);
    CardsManager.reduceDurabilityOrRemove(dragItemName);
    this.endAttack();
  },

  async resolveMultiAttack(dragEl, dragTarget) {
    const zedId = dragTarget.id;
    const cardZedDeck = CardsManager.getOpponentDeck();
    const targetPositionInDeck = cardZedDeck.indexOf(parseInt(zedId));
    const dragItemName = dragEl.dataset.item;
    const item = Props.isWeapon(dragItemName)
      ? WeaponsManager.getWeaponFromInventory(dragItemName)
      : Props.getItemFromInventory(dragItemName);

    /* hit 3 potential targets */
    let potentialTargets = [];
    cardZedDeck[targetPositionInDeck - 1] !== undefined
      ? potentialTargets.push(cardZedDeck[targetPositionInDeck - 1])
      : false;
    cardZedDeck[targetPositionInDeck] !== undefined
      ? potentialTargets.push(cardZedDeck[targetPositionInDeck])
      : false;
    cardZedDeck[targetPositionInDeck + 1] !== undefined
      ? potentialTargets.push(cardZedDeck[targetPositionInDeck + 1])
      : false;

    /* do this only once upfront for all attacks */
    Props.changePlayerProp('protection', item.protection);
    Props.changePlayerProp('actions', -1);

    for (let index = 0; index < potentialTargets.length; index++) {
      const targetId = potentialTargets[index];
      this.resolveAttack(dragItemName, Cards.getCardById(targetId));
      this.runHitAnimation(dragEl, Cards.getCardById(targetId));
      await TimingUtils.wait(150);
    }

    CardsManager.reduceDurabilityOrRemove(dragItemName);
    this.endAttack();
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

  resolveAttack: function (itemName, dragTarget) {
    const zedId = dragTarget.id;
    const zedObject = Props.getObject(zedId);
    const zedCardRef = Cards.getCardById(zedId);
    const battleCard = CardsManager.getBattleDeckCard(itemName);
    this.showBattleStats('+' + battleCard.protection, 'blue');
    zedObject.defense -= battleCard.damage + battleCard.modifyDamage;
    if (zedObject.defense <= 0) {
      zedCardRef.classList.add('dead');
      zedObject.dead = true;
      zedObject.fighting = false;
    } else {
      zedCardRef.querySelector('.health').textContent = zedObject.defense;
    }
  },

  endAttack: function () {
    // check if any items are left
    if (CardsManager.getBattleDeckSize() === 0) {
      this.showBattleMessage('No items left.<br>End turn to seal your fate...', 2000);
    }
    // refresh inventory slots
    Items.fillInventorySlots();
    // decide next steps
    if (CardsManager.zedIsDead()) {
      window.setTimeout(() => {
        Props.changePlayerProp('energy', -15);
        this.endBattle();
      }, 800);
    } else if (Player.getProp('actions') === 0) {
      this.endTurn();
    }
  },

  endTurn: function () {
    const allBattleCards = battlePlayContainer.querySelectorAll('.battle-card');
    this.renderDrawPile();
    if (allBattleCards) {
      allBattleCards.forEach(battleCard => {
        battleCard.classList.add('inactive');
      });
    }
    document.querySelector('#battle-cards .end-turn').classList.add('is--hidden');
    if (CardsManager.getBattleDeckSize() <= 0) {
      this.zedAttack();
    } else {
      this.showBattleMessage('Enemies Turn', 800);
      window.setTimeout(() => {
        this.zedAttack();
      }, 400);
    }
  },

  zedAttack: function () {
    const delay = CardsManager.getBattleDeckSize() <= 0 ? 400 : 1200;
    const allAttackingZeds = CardsManager.getOpponentDeck().filter(
      zed => Props.getObject(zed).fighting
    );

    for (let index = 0; index < allAttackingZeds.length; index += 1) {
      const zedId = allAttackingZeds[index];
      let zedCardRef = Cards.getCardById(zedId);
      const zedObject = Props.getObject(zedId);
      zedCardRef.classList.add('attacking');

      window.setTimeout(
        () => {
          let ratAteFood = false;
          if (zedObject.name === 'rat') {
            let foodItem = Items.getFirstItemOfType('eat');
            if (foodItem !== undefined) {
              ratAteFood = true;
              zedObject.defense += foodItem.protection;
              zedCardRef.querySelector('.health').textContent = zedObject.defense;
              //remove item from inventory
              Props.addItemToInventory(foodItem.name, -1);
              //remove item from battle deck
              CardsManager.removeFromBattleDeck(foodItem.name);
              /*battleDeckProps.number = battleDeck.length;*/
              this.renderDrawPile();
              this.showBattleStats(foodItem.name, 'image');
            }
          }
          if (!ratAteFood) {
            const attack = zedObject.attack;
            const dmg = Player.getProp('protection') - attack;
            if (dmg < 0) {
              Props.changePlayerProp('health', dmg);
              this.showBattleStats(dmg, 'red');
            } else {
              this.showBattleStats(-1 * attack, 'blue');
            }
            Props.changePlayerProp('protection', -1 * attack);
            battleHealthMeter.classList.add('heavy-shake');
          }
        },
        delay / 3 + index * delay
      );

      // single zed attacks
      window.setTimeout(
        () => {
          zedCardRef.classList.add('anim-punch');
          battleHealthMeter.classList.remove('heavy-shake');
          if (zedObject.name === 'rat') {
            Audio.sfx('rat-attacks');
          } else if (zedObject.name === 'bee') {
            Audio.sfx('bee-attacks');
          } else {
            Audio.sfx('zed-attacks');
          }
        },
        delay / 4 + index * delay
      );
    }

    // players turn after all zeds attacked
    window.setTimeout(
      () => {
        allAttackingZeds.forEach(function (zedId) {
          let zedCardRef = Cards.getCardById(zedId);
          zedCardRef.classList.remove('attacking');
          zedCardRef.classList.remove('anim-punch');
        });
        if (!Player.checkForDeath(false)) {
          this.nextTurn();
        }
      },
      delay / 4 + allAttackingZeds.length * delay
    );
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

  showBattleMessage: function (message, delay) {
    document.querySelector('#battle-message').innerHTML = message;
    document.querySelector('#battle-message').classList.add('active');
    window.setTimeout(() => {
      document.querySelector('#battle-message').classList.remove('active');
    }, delay);
  },
};
