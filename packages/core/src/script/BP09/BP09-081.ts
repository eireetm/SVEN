// BP09-081 Orator of the Bones (Evolved) — Abysscraft follower, 2/2. 死霊術師. (Its English name lacks
// "(Evolved)" in the data: data/fixes.ts.)
// On Evolve - Select an {[abysscraft]} follower in your cemetery and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { and, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isClass("Abysscraft"), isFollower) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
