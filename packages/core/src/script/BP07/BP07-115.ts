// BP07-115 Aldis, Trendsetting Seraph (Evolved) — 5/6.
// {[lastwords]} Deal 3 damage to each enemy leader.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 3);
      },
    }),
  ],
});
