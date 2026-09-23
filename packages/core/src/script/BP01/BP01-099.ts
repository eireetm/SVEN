// BP01-099 Dragon Wings — Dragoncraft spell, 3.
// Deal 2 damage to each follower on the field. If Overflow is active for you, deal 3 damage
// instead. (Both sides; Aura does not stop it — rulings.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const all = [...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))];
        yield* fx.dealDamageEach(all, g.overflow(fx.controller) ? 3 : 2);
      },
    }),
  ],
});
