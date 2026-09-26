// BP15-122 Merciless Voiding — Neutral spell, 3. 超克.
// Summon X Ancient Artifact tokens. X equals the number of enemy followers on the field.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const x = fx.game.followers(fx.game.opponent(fx.controller)).length;
        if (x > 0) yield* fx.summon(Array<string>(x).fill("Ancient Artifact"));
      },
    }),
  ],
});
