// BP06-068 Dragonblader — Dragoncraft follower, 4, 5/5. 竜使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Each player puts a Dragon token into their EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Dragon"], fx.controller);
        yield* fx.tokensToEx(["Dragon"], fx.game.opponent(fx.controller));
      },
    }),
  ],
});
