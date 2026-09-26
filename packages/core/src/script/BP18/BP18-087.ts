// BP18-087 Exhumation Crow (Evolved) — 3/3.
// On Evolve - Select a Demon follower in your cemetery and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { and, inYourZone, isFollower } from "../targets";
import { demon } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isFollower, demon) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
