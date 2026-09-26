// BP12-109 Romantic Chanteuse (Evolved) — Neutral follower, 4/4. シンガー.
// On Evolve - Give each enemy follower on the field "This follower doesn't deal damage" for the rest of
// this turn. (Only the followers there when it resolves; one destroyed later deals no Last Words damage
// either, CR 10.7.4.1.2 — rulings.)
// {[act]} {[cost02]}: Select an enemy follower on the field and engage it.
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.game.opponent(fx.controller))) yield* fx.cannotDealDamage(id, "endOfTurn");
      },
    }),
    activated(
      { playPoints: 2 },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.engage(fx.targets[0]!);
        },
      },
    ),
  ],
});
