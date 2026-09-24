// BP04-120 Grimnir, War Cyclone (Evolved) — Neutral, 5/6.
// Ward.
// On Evolve, {[cost04]}: Deal 4 damage to each enemy leader and enemy follower on the field.
import { defineCard, onEvolve } from "../helpers";
import { playPointsCost } from "../costs";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      cost: playPointsCost(4),
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamages([
          { target: fx.game.leader(opp), amount: 4 },
          ...fx.game.followers(opp).map((target) => ({ target, amount: 4 })),
        ]);
      },
    }),
  ],
});
