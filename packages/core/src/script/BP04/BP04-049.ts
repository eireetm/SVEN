// BP04-049 Concentration — Runecraft spell, 3. 魔法使い.
// (BP04-050 is the same card.)
// Give your leader +3 defense. Draw a card. Earth Rite: Draw 2 instead.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      earthRite: { mode: "optional" },
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.draw(fx.earthRitePaid ? 2 : 1);
      },
    }),
  ],
});
