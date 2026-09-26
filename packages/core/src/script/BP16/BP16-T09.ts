// BP16-T09 Astaroth's Reckoning — Neutral spell token, 10. 魔王.
// Change each enemy leader's defense to 1. (Not damage, so "doesn't take ability damage" doesn't stop it — ruling.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.setLeaderDefense(fx.game.opponent(fx.controller), 1);
      },
    }),
  ],
});
