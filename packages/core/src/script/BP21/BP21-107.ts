// BP21-107 Holy Armored Cheetah — Havencraft follower, 2, 2/3. 信仰・獣.
// Whenever your leader gains {[defense]}, give this Storm. (On the opponent's turn too — ruling.)
import { defineCard, whenYourLeaderGainsDefense } from "../helpers";

export default defineCard({
  abilities: [
    whenYourLeaderGainsDefense({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
