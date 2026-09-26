// BP20-052 Supplicant of Truth — Runecraft follower, 3, 3/3. 絶傑・魔法使い.
// Ward.
// {[fanfare]} Draw 2 cards, then discard a card. If this wasn't put onto the field from hand, give this {[defense]}+2. (From
// the EX area too — ruling.)
import { defineCard, fanfare } from "../helpers";
import { notFromHand } from "./shared-rune";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
        if (fx.game.card(fx.self)?.zone === "field" && notFromHand(fx.game, fx.self)) yield* fx.giveStats(fx.self, 0, 2);
      },
    }),
  ],
});
