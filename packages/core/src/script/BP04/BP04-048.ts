// BP04-048 Magic Illusionist (Evolved) — Runecraft, 4/4.
// {[lastwords]}, Earth Rite: Put this follower onto its owner's field. The evolved card goes back to
// the evolve deck and the base card comes back (ruling).
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      earthRite: { mode: "required" },
      *resolve(fx) {
        yield* fx.putOntoField([fx.self], fx.game.card(fx.self)?.owner ?? fx.controller);
      },
    }),
  ],
});
