// BP07-082 Berserk Demon — Abysscraft follower, 4, 6/6. 魔界.
// {[evolve]} {[cost03]}: Evolve this follower.
// {[fanfare]} Deal 3 damage to your leader.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(3),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 3);
      },
    }),
  ],
});
