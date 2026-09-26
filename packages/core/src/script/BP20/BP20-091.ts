// BP20-091 Nemean Lion — Abysscraft follower, 3, 3/4. 獣.
// Strike - Select an {[abysscraft]} follower in your cemetery and add it to your hand.
import { defineCard, strike } from "../helpers";
import { and, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    strike({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Abysscraft")) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
