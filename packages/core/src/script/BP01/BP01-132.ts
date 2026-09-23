// BP01-132 Chorus of Prayer — Havencraft spell, 7.
// Select up to 3 amulets that cost 5 play points or less in your cemetery and put them onto your
// field.
import { defineCard, spell } from "../helpers";
import { and, costAtMost, inYourZone, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { count: 3, upTo: true, filter: and(isAmulet, costAtMost(5)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
