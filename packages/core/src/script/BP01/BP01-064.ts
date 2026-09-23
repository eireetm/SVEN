// BP01-064 Alchemical Lore — Runecraft spell, 5.
// Deal 4 damage to each enemy follower on the field.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 4);
      },
    }),
  ],
});
