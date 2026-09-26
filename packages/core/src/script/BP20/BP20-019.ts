// BP20-019 Octrice, Hollowness Manifest — Swordcraft follower, 2, 2/3. 絶傑・盗賊.
// Whenever you play or fuse a Loot card, give this Storm. (Each fused Loot card counts, CR 12.18.4.1.)
// {[fanfare]} Choose one. (1) Put a Crest: Octrice, Hollowness Manifest token into your EX area. (2) Search your deck for a
// Returning Slash, reveal it, add it to your hand, then shuffle.
import { defineCard, fanfare, whenYouPlayOrFuse } from "../helpers";
import { named } from "../targets";
import { LOOT } from "./shared";

export default defineCard({
  abilities: [
    whenYouPlayOrFuse(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        },
      },
      LOOT,
    ),
    fanfare({
      modes: [
        {
          id: "crest",
          label: "(1) A Crest: Octrice, Hollowness Manifest into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx(["Crest: Octrice, Hollowness Manifest"]);
          },
        },
        {
          id: "search",
          label: "(2) A Returning Slash from your deck",
          *resolve(fx) {
            yield* fx.search((id) => named("Returning Slash")(fx.game, id));
          },
        },
      ],
    }),
  ],
});
