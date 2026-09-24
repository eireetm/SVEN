// BP04-108 Calydonian Boar — Havencraft follower, 5, 5/5. 信仰・獣.
// Rush.
// Once per turn, when an amulet you control leaves the field, give this follower +2/+2 and Assail
// (for good — ruling).
import { defineCard, whenAnotherAmuletLeaves } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    whenAnotherAmuletLeaves({
      oncePerTurn: true,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 2, 2);
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
  ],
});
