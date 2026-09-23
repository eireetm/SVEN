// BP01-131 Themis's Decree — Havencraft spell, 5.
// Destroy each follower on the field. (Aura does not protect — ruling.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.destroy([...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))]);
      },
    }),
  ],
});
