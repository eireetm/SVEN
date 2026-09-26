// BP20-006 Windbloom Sylph (Evolved) — 3/3.
// Whenever you play a Fae-Touched card, give your leader {[defense]}+1.
// On Evolve - Search your deck for a Fae-Touched card not named Windbloom Sylph, reveal it, add it to your hand, then
// shuffle.
import { defineCard, onEvolve, whenYouPlay } from "../helpers";
import { named } from "../targets";
import { fae } from "./shared";
import { sylphLeader } from "./shared-forest";

const sylph = named("Windbloom Sylph");

export default defineCard({
  abilities: [
    whenYouPlay(sylphLeader, fae),
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => fae(fx.game, id) && !sylph(fx.game, id));
      },
    }),
  ],
});
