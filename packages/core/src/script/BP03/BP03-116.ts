// BP03-116 Humpty Dumpty (Evolved) — Neutral, 4/4.
// On Evolve: Deal 5 to each follower on the field. Deal 3 to each enemy leader. Discard your hand.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const followers = [...fx.game.followers(fx.controller), ...fx.game.followers(fx.game.opponent(fx.controller))];
        yield* fx.dealDamages([
          ...followers.map((target) => ({ target, amount: 5 })),
          { target: fx.game.leader(fx.game.opponent(fx.controller)), amount: 3 },
        ]);
        yield* fx.discardHand();
      },
    }),
  ],
});
