// BP01-109 Hell's Unleasher — Abysscraft follower, 2, 2/2.
// {[act]}{[engage]}, put this card into its owner's cemetery: Select a follower that costs at
// least 3 play points in your cemetery and add it to your hand. (Not faceup evolve deck cards —
// ruling.)
import { activated, defineCard } from "../helpers";
import { and, costAtLeast, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [inYourZone("cemetery", { filter: and(isFollower, costAtLeast(3)) })],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
        },
      },
    ),
  ],
});
