// BP01-067 Runic Guardian — Runecraft follower, 3, 3/4.
// Ward. // {[fanfare]} Choose one of the following effects. (1) Earth Rite: Give this follower
// +1/+2. (2) Summon a Magic Sediment token.
// Option (1) can only be chosen when Earth Rite can be paid (CR 5.18.3.1.2, 13.3.3.2).
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      modes: [
        {
          id: "1",
          label: "Earth Rite: +1/+2",
          earthRite: true,
          *resolve(fx) {
            yield* fx.giveStats(fx.self, 1, 2);
          },
        },
        {
          id: "2",
          label: "Summon a Magic Sediment",
          *resolve(fx) {
            yield* fx.summon(["Magic Sediment"]);
          },
        },
      ],
    }),
  ],
});
