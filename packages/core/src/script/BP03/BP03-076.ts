// BP03-076 Odile, Black Swan — Abysscraft follower, 5, 6/4. 童話.
// {[fanfare]} Deal 2 to the enemy leader and each enemy follower. Necrocharge (20): Gain Storm.
// Strike: Deal 2 to the enemy leader and each enemy follower.
import { defineCard, fanfare, strike } from "../helpers";

function* aoe(fx: import("../../engine/effects/context").EffectContext, n: number) {
  const opp = fx.game.opponent(fx.controller);
  yield* fx.dealDamages([
    { target: fx.game.leader(opp), amount: n },
    ...fx.game.followers(opp).map((target) => ({ target, amount: n })),
  ]);
}

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* aoe(fx, 2);
        if (fx.game.necrocharge(fx.controller, 20)) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    strike({
      *resolve(fx) {
        yield* aoe(fx, 2);
      },
    }),
  ],
});
