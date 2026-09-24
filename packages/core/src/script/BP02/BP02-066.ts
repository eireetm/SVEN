// BP02-066 Dragontamer (Evolved) — 3/3.
// On Evolve, discard a card: Select a Wyrmkin follower in your cemetery and add it to your hand.
// (The target is selected before the cost is paid, so the discarded card cannot be chosen, and
// without a target the cost cannot be paid — rulings; CR 10.6.2.3, 10.6.2.5.)
import { defineCard, onEvolve } from "../helpers";
import { discardA } from "../costs";
import { and, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(() => true),
      targets: [inYourZone("cemetery", { filter: and(isFollower, hasTrait("竜族")) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
