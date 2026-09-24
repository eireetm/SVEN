// BP04-047 Magic Illusionist — Runecraft follower, 2, 2/2. 魔法使い.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[lastwords]}, Earth Rite: Put this follower onto its owner's field. (Earth Rite is asked for when
// it resolves; without it nothing happens.)
import { defineCard, evolveAbility, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    lastWords({
      earthRite: { mode: "required" },
      *resolve(fx) {
        yield* fx.putOntoField([fx.self], fx.game.card(fx.self)?.owner ?? fx.controller);
      },
    }),
  ],
});
