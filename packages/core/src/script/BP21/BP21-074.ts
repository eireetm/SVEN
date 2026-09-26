// BP21-074 Cornelius, the Corpse King (Evolved) — 3/3.
// On Evolve - Select an Academic follower that costs 3 or less in your cemetery and summon it. (元のコスト.)
// On Super-Evolve - Do the following 3 times. "Roll a 6-sided die." (CR 5.20; the abilities each roll triggers wait until
// the rolls are done — ruling, CR 10.7.3.)
import { costAtMost, inYourZone } from "../targets";
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { academicFollower } from "./shared";
import { rollDice } from "./shared-abyss";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: (g, id) => academicFollower(g, id) && costAtMost(3)(g, id) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* rollDice(fx, 3);
      },
    }),
  ],
});
