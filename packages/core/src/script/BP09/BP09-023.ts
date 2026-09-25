// BP09-023 Nonja, Silent Maid — Swordcraft follower, 3, 4/4. 兵士・メイド.
// This card costs 1 less to play if there's a Prim, Innocent Princess on your field.
// {[fanfare]} Draw 2 cards. Discard 2 cards.
import { defineCard, fanfare } from "../helpers";
import { onYourField } from "./shared";

export default defineCard({
  playCost: (g, _self, controller) => (onYourField(g, controller, "Prim, Innocent Princess") ? -1 : 0),
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(2);
        const n = Math.min(2, fx.game.cards(fx.controller, "hand").length);
        yield* fx.discard(fx.controller, n, n);
      },
    }),
  ],
});
