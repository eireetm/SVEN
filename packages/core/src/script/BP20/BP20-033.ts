// BP20-033 Devotee of Usurpation — Swordcraft follower, 3, 3/2. 絶傑・盗賊.
// Rush.
// Whenever you play or fuse a Loot card, give this Assail. (On the opponent's turn too — ruling.)
// {[lastwords]} Put a Gilded Goblet and Gilded Boots token into your EX area.
import { defineCard, lastWords, whenYouPlayOrFuse } from "../helpers";
import { GILDED_BOOTS, GILDED_GOBLET, LOOT } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    whenYouPlayOrFuse(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "assail");
        },
      },
      LOOT,
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([GILDED_GOBLET, GILDED_BOOTS]);
      },
    }),
  ],
});
