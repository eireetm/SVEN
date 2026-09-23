// BP01-124 Undead King — Abysscraft follower, 6, 6/6.
// {[fanfare]} Select up to 2 followers in your cemetery and add them to your hand.
// (Selected when the ability is played, so the King itself can be chosen if it is already in the
// cemetery; choosing none is fine — rulings.)
import { defineCard, fanfare } from "../helpers";
import { inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { count: 2, upTo: true, filter: isFollower })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
