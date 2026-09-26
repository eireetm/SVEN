// BP10-015 Crocus Rat — Forestcraft follower, 1, 2/2. 植物族・獣.
// {[fanfare]} {[cost05]} Select an enemy follower on the field. Put it on the bottom of its owner's
// deck and draw a card. (A token put into a deck is removed from the game, CR 9.1.4.1.)
// When this card is returned to hand from your field, give your leader {[defense]}+1.
import { playPointsCost } from "../costs";
import { defineCard, fanfare, whenReturnedToHand } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(5),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putOnDeck(fx.targets[0]!, "bottom");
        yield* fx.draw(1);
      },
    }),
    whenReturnedToHand({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
