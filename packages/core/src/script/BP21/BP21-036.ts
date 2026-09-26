// BP21-036 Lieutenant's Report — Swordcraft spell, 2. 指揮官.
// Select up to 2 Officer followers in your cemetery and add them to your hand.
import { defineCard, spell } from "../helpers";
import { and, inYourZone, isFollower } from "../targets";
import { officer } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { count: 2, upTo: true, filter: and(isFollower, officer) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0] ?? []);
      },
    }),
  ],
});
