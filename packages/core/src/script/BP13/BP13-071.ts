// BP13-071 Aluzard, Timeworn Vampire — Abysscraft follower, 2, 2/2. 荒野・吸血鬼.
// This card can't be played from the EX area while there are dormancy counters on it.
// ----------
// {[evolve]} {[cost01]}: Evolve this follower.
// At the start of your main phase, remove a dormancy counter from this card in your EX area: If there are
// no dormancy counters on this card, summon it.
// {[lastwords]} Put this card into its owner's EX area. Place 2 dormancy counters on it.
import { defineCard, evolveAbility, lastWords } from "../helpers";
import { aluzardAwakens, aluzardSleeps, playableUnlessDormant } from "./shared-abyss";

export default defineCard({
  playableIf: playableUnlessDormant,
  abilities: [
    evolveAbility(1),
    aluzardAwakens,
    lastWords({
      *resolve(fx) {
        yield* aluzardSleeps(fx, false);
      },
    }),
  ],
});
