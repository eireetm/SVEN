// BP15-052 Scroll Wizard (Evolved) — Runecraft follower, 4/4. 魔法使い.
// On Evolve - Discard a spell: Deal 4 damage to each enemy follower on the field. (CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(isSpell),
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 4);
      },
    }),
  ],
});
