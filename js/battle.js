import Audio from './audio.js';
import UiBattle from './ui-battle.js';
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
  WeaponsManager,
  CompanionManager,
  ObjectState,
  GameState,
  BattleManager,
} from './core/index.js';
import TimingUtils from './utils/timing-utils.js';

const battlePlayContainer = document.querySelector('#battle-cards .play');
const defensiveCardsContainer = document.querySelector('#defensive-cards');

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
          UiBattle.scratchAnim(targetObjectRef);
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

  startCompanionBattle(singleZedId) {
    if (!singleZedId) {
      return;
    }
    this.prepareBattle();
    const cardZedDeck = BattleManager.addIdToOpponentDeck(singleZedId);
    this.spawnZedDeck(cardZedDeck);
    this.enterBattleMode(false);
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

  enterBattleMode(defaultBattle = true) {
    Weapons.updateWeaponState();
    Player.resetPreviewProps();
    UiBattle.enterUIBattleMode(defaultBattle);
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

  includeDefensiveObjects: function () {
    /* defensive objects stand around the player, so player should be the reference position */
    const playerPosition = GameState.getGameProp('playerPosition');
    const allFoundObjectIds = ObjectState.findAllObjectsNearby(playerPosition.x, playerPosition.y);
    const barricadesOnly = allFoundObjectIds.filter(
      singleObject => Props.getObject(singleObject).name === 'barricades'
    );
    if (barricadesOnly.length > 0) {
      BattleManager.includeBarricadesInBattle(barricadesOnly);
    }
    this.updateDefensiveCardsContainer();
  },

  updateDefensiveCardsContainer: function () {
    const defensiveDeck = BattleManager.getDefensiveDeck();
    if (!defensiveDeck || defensiveDeck.length === 0) {
      return;
    }
    defensiveCardsContainer.innerHTML = '';
    for (var i = defensiveDeck.length; i > 0; i -= 1) {
      const defensiveObject = Props.getObject(defensiveDeck[i - 1]);
      if (defensiveObject.durability > 0) {
        this.addDefensiveCard(defensiveObject, (i - 1) * 15);
      }
    }
  },

  addDefensiveCard: function (defensiveObject, offsetX = 0) {
    const durabilityMarkup = this.createDurabilityMarkup(
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

  startBattle(targetEnemyObject, surprised, singleZedId) {
    this.prepareBattle();
    // singleZedId is the result of successful luring
    let cardZedDeck = singleZedId
      ? BattleManager.addIdToOpponentDeck(singleZedId)
      : BattleManager.addAllZedsNearby(targetEnemyObject);
    if (cardZedDeck.length > 0) {
      this.spawnZedDeck(cardZedDeck);
      this.enterBattleMode();
      this.includeDefensiveObjects();
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
      remainingCards !== undefined ? remainingCards : BattleManager.getBattleDeckSize();
    document.getElementById('draw-amount').textContent = totalCards;

    const pileSize = Math.min(
      BattleManager.getBattleDeckSize(),
      BattleManager.getMaxDrawPileSize()
    );

    const allDrawPileCards = UiBattle.getAllDrawPileCards();

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
    UiBattle.showDrawPileCards(pileSize);
  },

  spawnCompanionDeck: function () {
    const companion = CompanionManager.getCompanionFromInventory();
    battlePlayContainer.innerHTML = '';
    const healthMarkup = CompanionManager.generateHealthMarkup();
    UiBattle.generateCompanionCard(companion.name, companion.damage, healthMarkup);
  },

  spawnBattleDeck: function (surprised) {
    const sparedItems = BattleManager.generateBattleDeck();
    const battleDeck = BattleManager.getBattleDeck();
    if (sparedItems > 0) {
      UiBattle.showBattleMessage(
        `${GameState.getGameProp('character')} spares ${sparedItems} items`,
        2000
      );
    }
    UiBattle.generateDrawPile(Math.min(battleDeck.length, BattleManager.getMaxDrawPileSize()));

    /* render draw pile */
    this.renderDrawPile();
    if (surprised) {
      document.querySelector('#battle-cards .end-turn').classList.add('is--hidden');
      document.getElementById('battle-cards').classList.remove('is--hidden');
      UiBattle.showBattleMessage('Oh no! You walked into them!', 2000);
      window.setTimeout(() => {
        this.zedAttack();
      }, 600);
    } else {
      this.nextTurn();
    }
  },

  async leaveBattleMode() {
    UiBattle.leaveUIBattleMode();
    await TimingUtils.wait(100);
    document.querySelector('#cards .cards-blocker').classList.add('is--hidden');
    Props.setGameProp('battle', false);
    Crafting.checkCraftingPrerequisits();
    Player.updatePlayer();
    Weapons.updateWeaponState();
    Player.lockMovement(false);
    Props.pauseGame(false);
  },

  endBattle: async function () {
    BattleManager.removeBattleDeck();
    const cardZedDeck = BattleManager.getOpponentDeck();
    const defensiveDeck = BattleManager.getDefensiveDeck();
    Companion.updateCompanionSlot();
    await this.leaveBattleMode();
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
    defensiveDeck.forEach(function (defensiveId) {
      const defensiveObject = Props.getObject(defensiveId);
      const defensiveCardRef = Cards.getCardById(defensiveId);
      if (defensiveObject.durability <= 0) {
        Cards.removeAction('rest', defensiveCardRef, defensiveObject);
      }
    });
    ActionsOrchestration.endAction(cardZedDeck[0]);
    ActionsOrchestration.goBackFromAction();
    BattleManager.removeOpponentDeck();
    BattleManager.removeDefensiveDeck();
  },

  nextTurn: function () {
    Props.changePlayerProp('protection', -100);
    Props.changePlayerProp('actions', -100);
    Props.changePlayerProp('actions', 3);

    const firstDurableCard = BattleManager.getFirstDurableCardFromDefensiveDeck();
    if (firstDurableCard) {
      /* add protection from first defensive card if present */
      Props.changePlayerProp('protection', firstDurableCard.defense);
    }

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

    const battleDeck = BattleManager.getBattleDeck();

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

  createDurabilityMarkup: function (weaponName, durability) {
    const weaponDefiniton = Props.getWeaponDefinition(weaponName);
    const maxDurabilityChars = '◈'.repeat(weaponDefiniton.durability);
    return (
      '<span class="durability">' +
      maxDurabilityChars.substring(0, durability) +
      '<u>' +
      maxDurabilityChars.substring(0, maxDurabilityChars.length - durability) +
      '</u>' +
      '</span>'
    );
  },

  getDurabilityMarkup: function (itemName) {
    if (Props.isWeapon(itemName)) {
      const inventoryWeapon = WeaponsManager.getWeaponFromInventory(itemName);
      if (inventoryWeapon.durability && inventoryWeapon.durability > 0) {
        return this.createDurabilityMarkup(itemName, inventoryWeapon.durability);
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
      const inventoryWeapon = WeaponsManager.getWeaponFromInventory(itemName);
      return inventoryWeapon.durability === 1
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

  getCardMarkup: function (itemName) {
    const card = BattleManager.getBattleDeckCard(itemName);
    const modifyDamageMarkup =
      card?.modifyDamage && card.modifyDamage > 0
        ? '<span class="modify">(+' + card.modifyDamage + ')<span>'
        : '';
    const durabilityMarkup = this.getDurabilityMarkup(itemName);
    const pictureMarkup = this.getPictureMarkup(itemName);
    const lastUseMarkup = this.getLastUseMarkup(itemName);

    return (
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

  addCardToPlay: function (itemName) {
    battlePlayContainer.insertAdjacentHTML('beforeend', this.getCardMarkup(itemName));
  },

  resolveSingleAttack: function (dragEl, dragTarget) {
    const dragItemName = dragEl.dataset.item;
    const battleCard = BattleManager.getBattleDeckCard(dragItemName);
    Props.changePlayerProp('protection', battleCard.protection);
    Props.changePlayerProp('actions', -1);
    this.resolveAttack(dragItemName, dragTarget);
    this.runHitAnimation(dragEl, dragTarget);
    BattleManager.reduceDurabilityOrRemove(dragItemName);
    this.endAttack();
  },

  async resolveMultiAttack(dragEl, dragTarget) {
    const zedId = dragTarget.id;
    const cardZedDeck = BattleManager.getOpponentDeck();
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

    BattleManager.reduceDurabilityOrRemove(dragItemName);
    this.endAttack();
  },

  runHitAnimation: function (dragEl, zedCardRef) {
    Audio.sfx('punch');
    // run "hit" animation
    UiBattle.scratchAnim(zedCardRef);
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

  updateZedCard: function (zedId) {
    const zedObject = Props.getObject(zedId);
    const zedCardRef = Cards.getCardById(zedId);
    if (zedObject.defense <= 0) {
      zedCardRef.classList.add('dead');
      zedObject.dead = true;
      zedObject.fighting = false;
    } else {
      zedCardRef.querySelector('.health').textContent = zedObject.defense;
    }
  },

  resolveAttack: function (itemName, dragTarget) {
    const zedId = dragTarget.id;
    const zedObject = Props.getObject(zedId);
    const battleCard = BattleManager.getBattleDeckCard(itemName);
    UiBattle.showBattleStats('+' + battleCard.protection, 'blue');
    zedObject.defense -= battleCard.damage + battleCard.modifyDamage;
    this.updateZedCard(zedId);
  },

  endAttack: function () {
    // check if any items are left
    if (BattleManager.getBattleDeckSize() === 0) {
      UiBattle.showBattleMessage('No items left.<br>End turn to seal your fate...', 2000);
    }
    // refresh inventory slots
    Items.fillInventorySlots();
    // decide next steps
    if (!this.checkForAllZedsDefeated() && Player.getProp('actions') === 0) {
      this.endTurn();
    }
  },

  checkForAllZedsDefeated: function () {
    if (BattleManager.zedIsDead()) {
      window.setTimeout(() => {
        Props.changePlayerProp('energy', -15);
        this.endBattle();
      }, 800);
      return true;
    }
    return false;
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
    if (BattleManager.getBattleDeckSize() <= 0) {
      this.zedAttack();
    } else {
      UiBattle.showBattleMessage('Enemies Turn', 800);
      window.setTimeout(() => {
        this.zedAttack();
      }, 400);
    }
  },

  zedAttack: function () {
    const delay = BattleManager.getBattleDeckSize() <= 0 ? 400 : 1200;
    const allAttackingZeds = BattleManager.getOpponentDeck().filter(
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
              BattleManager.removeFromBattleDeck(foodItem.name);
              this.renderDrawPile();
              UiBattle.showBattleStats(foodItem.name, 'image');
            }
          }
          if (!ratAteFood) {
            const attack = zedObject.attack;
            const defensiveCard = BattleManager.getFirstDurableCardFromDefensiveDeck();
            if (defensiveCard) {
              defensiveCardsContainer.classList.add('heavy-shake');
              /* we already added the protection effect of that card */
              /* here we apply the cards damage to the zed */
              /* we also check if zed is dead before zeds damage is applied to the player */
              zedObject.defense -= defensiveCard.attack;
              this.updateZedCard(zedId);
              /* reduce durability or defensive card itself */
              defensiveCard.durability -= 1;
              if (defensiveCard.durability <= 0) {
                UiBattle.showBattleMessage('Your ' + defensiveCard.name + ' broke!', 2000);
              }
              this.updateDefensiveCardsContainer();
            }
            /* zed is dealing damage to player even if it died from defensive card */
            const dmg = Player.getProp('protection') - attack;
            if (dmg < 0) {
              Props.changePlayerProp('health', dmg);
              UiBattle.showBattleStats(dmg, 'red');
            } else {
              UiBattle.showBattleStats(-1 * attack, 'blue');
            }
            Props.changePlayerProp('protection', -1 * attack);
            UiBattle.startHealthMeterShake();
          }
        },
        delay / 3 + index * delay
      );

      // single zed attacks
      window.setTimeout(
        () => {
          zedCardRef.classList.add('anim-punch');
          UiBattle.stopHealthMeterShake();
          defensiveCardsContainer.classList.remove('heavy-shake');
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
        if (!this.checkForAllZedsDefeated() && !Player.checkForDeath(false)) {
          this.nextTurn();
        }
      },
      delay / 4 + allAttackingZeds.length * delay
    );
  },
};
