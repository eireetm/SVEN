// BP17-019 Erika, Loyal Swordsavant — Swordcraft follower, 2, 1/1. 兵士・暗殺者・メイド.
// Storm.
// {[fanfare]} Summon a Steelclad Knight, Shield Guardian, or Knight token.
// Strike - If there are 5 {[swordcraft]} cards on your field, give this {[attack]}+2. (Checked as it resolves, before
// the quick timing — ruling.)
import { defineCard, fanfare, strike } from "../helpers";
import { isClass } from "../targets";
import { countIn } from "./shared";
import { summonOneOfficerToken } from "./shared-sword";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({ resolve: summonOneOfficerToken }),
    strike({
      condition: (g, p) => countIn(g, p, "field", isClass("Swordcraft")) === 5,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
