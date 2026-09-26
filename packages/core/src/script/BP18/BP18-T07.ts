// BP18-T07 Diurnal Slumber — Abysscraft spell token, 1. 透京・魔界.
// Select up to 3 Togh Keyoh cards in your cemetery with different names that cost 2 or less and add them to your hand.
// (元のコスト.)
import { defineCard, spell } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { toghKeyoh } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { count: 3, upTo: true, distinctNames: true, filter: and(toghKeyoh, costAtMost(2)) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
