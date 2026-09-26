// BP16-109 Mainyu, Darkdweller — Havencraft follower, 2, 2/2. 狂信.
// Aura.
// Whenever an amulet is put onto your field, give this {[attack]}+1. (Each copy; not when an Idol evolves; also during
// the opponent's turn — rulings.)
import { defineCard, whenCardEntersYourField } from "../helpers";

export default defineCard({
  keywords: ["aura"],
  abilities: [
    whenCardEntersYourField(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
        },
      },
      { type: "amulet" },
    ),
  ],
});
