// BP02-062 Dracomancer's Rites — Dragoncraft amulet, 3.
// {[fanfare]} Discard a card: Give your leader {[defense]}+1. (Optional cost, CR 10.4.7.)
// At the start of your end phase, if you discarded a card this turn, select an enemy leader or
// enemy follower on the field and deal it 2 damage. (Discards for the hand limit come later in the
// end phase and do not count — ruling; CR 7.4.1, 7.4.7.)
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(() => true),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, c) => g.discardedThisTurn(c) > 0,
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
