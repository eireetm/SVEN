// CP02-082 Rina Fujimoto — Abysscraft follower, 2, 3/1. デレマス・キュート.
// This card costs 1 less to play if a follower on your field evolved this turn.
// ----------
// {[fanfare]} If Sanguine is active for you, select an enemy follower on the field and deal it 3 damage. (Sanguine works in a
// universe deck too — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playCost: (g, _self, c) => (g.followerEvolvedThisTurn(c) ? -1 : 0),
  abilities: [
    fanfare({
      condition: (g, c) => g.sanguine(c),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
