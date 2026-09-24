// BP02-103 Soul Collector (Evolved) — 5/5.
// On Evolve: Select a {[havencraft]} follower in your cemetery and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { and, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Havencraft")) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
