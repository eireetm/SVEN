// BP18-050 Clandestined Dealings — Runecraft spell, 3. 透京・錬金術師・商人.
// Choose 1. (1) Select an enemy follower on the field. Destroy it and banish the top 2 cards of your deck. (2) {[cost01]}:
// Select up to 2 followers in your banished zone with different names that cost 2 or less and summon them.
// ((1) needs its target — ruling. (2)'s cost is asked as it resolves, CR 10.4.7.5; 元のコスト.)
import { playPointsCost } from "../costs";
import { defineCard, spell } from "../helpers";
import { and, costAtMost, enemyFollower, inYourZone, isFollower } from "../targets";
import { banishTop } from "./shared-rune";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "destroy",
          label: "(1) Destroy an enemy follower, banish the top 2 cards of your deck",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
            yield* banishTop(fx, 2);
          },
        },
        {
          id: "summon",
          label: "(2) (1): Up to 2 followers (2 or less, different names) from your banished zone onto the field",
          cost: playPointsCost(1),
          targets: [inYourZone("banished", { count: 2, upTo: true, distinctNames: true, filter: and(isFollower, costAtMost(2)) })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
