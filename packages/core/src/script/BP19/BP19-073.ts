// BP19-073 Call of the Megalorca — Dragoncraft spell, 2. 海洋.
// This costs 1 less to play from your EX area.
// Summon a Megalorca token. Draw a card. If Overflow is active for you, summon a Megalorca token.
import { defineCard, spell } from "../helpers";
import { MEGALORCA } from "./shared";

export default defineCard({
  playCost: (g, self) => (g.playZone(self) === "ex" ? -1 : 0),
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon([MEGALORCA]);
        yield* fx.draw(1);
        if (fx.game.overflow(fx.controller)) yield* fx.summon([MEGALORCA]);
      },
    }),
  ],
});
