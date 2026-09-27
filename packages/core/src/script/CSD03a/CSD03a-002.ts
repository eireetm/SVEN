// CSD03a-002 King of Knights, Alfred (Evolved) — 4/4. (Evolved from CSD03a-001 by name.)
// Storm. Twin Drive.
// On Evolve - Search your deck for a Royal Paladin follower that costs 3 or less, summon it, then shuffle. If there are at least
// 15 Royal Paladin cards in your cemetery, give it and this follower {[attack]}+1/{[defense]}+1. (元のコスト. With none found,
// this follower still gets +1/+1 — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost } from "../targets";
import { countIn, followerThat, royalPaladin } from "../CP03/shared";

export default defineCard({
  keywords: ["storm", "twinDrive"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const found = yield* fx.search((id) => followerThat(royalPaladin)(g, id) && costAtMost(3)(g, id), { to: "field" });
        if (countIn(g, fx.controller, "cemetery", royalPaladin) < 15) return;
        for (const id of [...found, fx.self]) if (g.card(id)?.zone === "field") yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
