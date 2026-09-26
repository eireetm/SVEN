// BP15-009 Rejuvenating Resurrection — Forestcraft spell, 2. エルフ族・精霊.
// Select a follower in your cemetery with "Amataz" in its name and summon it.
import { defineCard, spell } from "../helpers";
import { and, inYourZone, isFollower, nameIncludes } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(isFollower, nameIncludes("Amataz")) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
