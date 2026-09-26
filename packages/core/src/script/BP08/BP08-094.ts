// BP08-094 Colette, Holy Gunner (Evolved) — Havencraft follower, 3/2. 信仰.
// On Evolve: each opponent buries a follower they control. This is the opponent choosing a card,
// not this ability selecting it, so Aura does not protect it (ruling; CR 5.34, 12.15).
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        const followers = fx.game.followers(opponent);
        if (followers.length > 0) yield* fx.bury(yield* fx.chooseCards(followers, 1, 1, opponent));
      },
    }),
  ],
});
