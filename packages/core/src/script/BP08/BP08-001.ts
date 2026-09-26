// BP08-001 Forest Oracle Pascale — Forestcraft follower, 7, 4/7. 精霊・ダンサー.
// Ward.
// {[fanfare]} Select an enemy follower on the field and put it on the top of its owner's deck.
// (A token put into a deck is removed from the game, CR 9.1.4.1.)
// At the start of your end phase, give each other follower on your field {[attack]}+2/{[defense]}+2
// and your leader {[defense]}+4.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putOnDeck(fx.targets[0]!, "top");
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) if (id !== fx.self) yield* fx.giveStats(id, 2, 2);
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
