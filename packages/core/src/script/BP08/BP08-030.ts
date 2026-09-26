// BP08-030 Zealot of Usurpation — Swordcraft follower, 2, 3/2. 絶傑・盗賊・キラー.
// Rush. Fanfare: mill the opponent's top card, then if their cemetery has at least 10 cards put
// your top card into your EX area. An empty deck simply mills nothing (ruling; CR 1.3.2, 5.34).
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.mill(1, opponent);
        if (fx.game.cards(opponent, "cemetery").length >= 10) yield* fx.topToEx(1);
      },
    }),
  ],
});
