// BP15-050 Elimination Unleashed — Runecraft spell, 6. 絶傑・魔法使い.
// Select up to 3 followers in your cemetery with both the Omen and Mage traits that cost a total of 9 or less.
// Summon them and give them "At the start of your end phase, destroy this." (元のコスト. Up to 3, so it can be
// played without them; nothing happens between playing and resolving it, so they are selected as it resolves.)
import { defineCard, selectWithinTotalCost, spell } from "../helpers";
import { omenMageFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const candidates = fx.game.cards(fx.controller, "cemetery").filter((id) => omenMageFollower(fx.game, id));
        for (const id of yield* fx.putOntoField(yield* selectWithinTotalCost(fx, candidates, 9, 3))) {
          if (fx.game.card(id)?.zone === "field") yield* fx.grant(id, "destroyAtEnd");
        }
      },
    }),
  ],
});
