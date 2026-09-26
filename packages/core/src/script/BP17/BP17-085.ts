// BP17-085 Rouge Vampire — Abysscraft follower, 1, 2/2. 吸血鬼.
// {[evolve]} {[cost04]}: Evolve this.
// {[fanfare]} Deal 1 damage to your leader.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(4),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
      },
    }),
  ],
});
