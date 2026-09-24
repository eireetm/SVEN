// BP02-071 Soul Dealer — Abysscraft follower, 4, 6/5.
// {[evolve]}{[cost02]}: Evolve this follower. // Ward.
// {[fanfare]} Deal 3 damage to your leader.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 3);
      },
    }),
  ],
});
