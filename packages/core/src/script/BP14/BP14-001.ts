// BP14-001 Hozumi, Enchanting Hostess — Forestcraft follower, 3, 2/2. 宴楽・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} The next Festive card you play this turn costs 2 less.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { festive } from "./shared";

export default defineCard({
  nextPlay: { festive: (g, card) => festive(g, card) },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("festive", 2);
      },
    }),
  ],
});
