// BP10-054 XI. Erntz, Justice — Dragoncraft follower, 8, 8/8. アルカナ・竜族.
// Ward.
// {[fanfare]} Put the top card of your deck into your EX area. If you put a card that costs 5 or more
// into your EX area, evolve this follower or return it to its owner's hand. (元のコスト. If it isn't
// evolved it returns; an effect's evolve isn't limited to once per turn — rulings.)
// When this card leaves the field, give your leader {[defense]}+8. (Being stolen isn't leaving the
// field — ruling, CR 10.7.4.3.)
import { defineCard, fanfare, whenThisLeavesField } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const [moved] = yield* fx.topToEx(1);
        if (moved === undefined || (fx.game.info(moved).cost ?? 0) < 5) return;
        if (fx.game.card(fx.self)?.zone !== "field") return;
        if (!(yield* fx.evolve(fx.self))) yield* fx.returnToHand([fx.self]);
      },
    }),
    whenThisLeavesField({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 8);
      },
    }),
  ],
});
