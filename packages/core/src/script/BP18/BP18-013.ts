// BP18-013 Sowing Paradise — Forestcraft spell, 5. 透京・植物族.
// This costs X less to play. X equals the number of faceup evolved Togh Keyoh followers in your evolve deck.
// ----------
// Select up to 2 Togh Keyoh followers in your cemetery and add them to your hand.
import { defineCard, spell } from "../helpers";
import { and, inYourZone, isFollower } from "../targets";
import { faceupToghKeyoh, toghKeyoh } from "./shared";

export default defineCard({
  playCost: (g, _self, p) => -faceupToghKeyoh(g, p),
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { count: 2, upTo: true, filter: and(isFollower, toghKeyoh) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
