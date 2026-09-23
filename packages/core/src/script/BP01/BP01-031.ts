// BP01-031 Frontguard General — Swordcraft follower, 7, 6/8.
// Ward. // {[lastwords]} Summon 2 Steelclad Knight tokens and give them Ward. You may engage any
// number of them. (Only those two get Ward — ruling.)
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        const knights = yield* fx.summon(["Steelclad Knight", "Steelclad Knight"]);
        for (const k of knights) yield* fx.giveKeyword(k, "ward");
        yield* fx.engage(yield* fx.chooseCards(knights, 0, knights.length));
      },
    }),
  ],
});
