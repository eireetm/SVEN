// BP15-071 Tiniest Dragon (Evolved) — Dragoncraft follower, 3/3. 竜族.
// On Evolve - Deal 5 damage to each follower on the field. (This one too.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.dealDamageEach([...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))], 5);
      },
    }),
  ],
});
