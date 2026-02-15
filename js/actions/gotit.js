import Player from '../player.js';
import Props from '../props.js';
import Cards from '../cards.js';

export default function gotIt(actionsOrchestration, cardId) {
  const object = Props.getObject(cardId);
  if (object && object.title === 'You found it!') {
    Player.checkForWin();
  } else if (object.title === 'Waking Up') {
    document.getElementById('player').classList.remove('highlight');
    document.getElementById('player-hint').classList.add('is--hidden');
  }
  Cards.removeCard(cardId);
  Player.lockMovement(false);
  Player.updatePlayer(true);
  Cards.renderCardDeck();
}
