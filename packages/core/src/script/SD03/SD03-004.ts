// SD03-004 Demonflame Mage (Evolved) — 4/4.
// On Evolve: Deal 2 damage to each enemy follower on the field. (Aura doesn't stop it: nothing is selected — ruling.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
