// BP12-022 Ironfist Beast Warrior (Evolved) — Swordcraft follower, 6/8. 指揮官・獣.
// Ward.
// On Evolve - Put the top card of your deck into your EX area. The next card you play from the EX area
// this turn costs 10 less to play.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  nextPlay: { fromEx: (g, card) => g.playZone(card) === "ex" },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.topToEx(1);
        yield* fx.nextPlayCostsLess("fromEx", 10);
      },
    }),
  ],
});
