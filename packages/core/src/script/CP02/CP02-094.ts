// CP02-094 Haru Yuuki — Havencraft follower, 2, 2/2. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there's a Risa Matoba on your field, give this follower {[attack]}+1/{[defense]}+1 and Storm.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, c) => g.cards(c, "field").some((id) => named("Risa Matoba")(g, id)),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
