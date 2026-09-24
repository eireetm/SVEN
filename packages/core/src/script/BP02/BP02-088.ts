// BP02-088 Necrocarnival — Abysscraft spell, 3.
// Choose one of the following. Necrocharge (10): Choose up to 2 instead.
// (1) Select a follower that costs 2 play points or less in your cemetery and put it onto your
// field. (2) Summon 2 Ghost tokens.
// (CR 5.18.2.1: at least one, each at most once — rulings; Necrocharge decides the number when the
// card is played, 5.18.3.1.1.)
import { defineCard, spell } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, c) => (g.necrocharge(c, 10) ? 2 : 1),
      modes: [
        {
          id: "1",
          label: "Put a follower costing 2 or less from your cemetery onto your field",
          targets: [inYourZone("cemetery", { filter: and(isFollower, costAtMost(2)) })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
        {
          id: "2",
          label: "Summon 2 Ghost tokens",
          *resolve(fx) {
            yield* fx.summon(["Ghost", "Ghost"]);
          },
        },
      ],
    }),
  ],
});
