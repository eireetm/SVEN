// BP14-040 Bergent, Layered Sorceress (Evolved) — Runecraft follower, 3/3. 魔法使い・魔法生物.
// On Evolve - Discard an Onion Patch: Draw 2 cards.
// {[lastwords]} You may put this into its owner's EX area.
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";
import { mayGoToExLastWords } from "../BP13/shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(named("Onion Patch")),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
    mayGoToExLastWords,
  ],
});
