// BP17-T03 Storm Arrow — Forestcraft spell token, 1. エルフ族.
// Combo (5) - Deal 2 damage to each enemy leader. (CR 13.2.1.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        if (fx.game.combo(fx.controller, 5)) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
