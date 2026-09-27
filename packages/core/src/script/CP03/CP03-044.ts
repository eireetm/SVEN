// CP03-044 Nightmare Doll, Alice (Evolved) — 4/4.
// Twin Drive.
// On Evolve - Choose one. (1) Select a Pale Moon follower that costs 2 or less in your banished zone and summon it. (2)
// {[cost04]}: Select a Pale Moon follower in your banished zone and summon it. (The option's cost is paid when it resolves, CR
// 10.4.7.5. 元のコスト.)
import { playPointsCost } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, inYourZone } from "../targets";
import { followerThat, paleMoon } from "./shared";

export default defineCard({
  keywords: ["twinDrive"],
  abilities: [
    onEvolve({
      modes: [
        {
          id: "1",
          label: "Summon a 2-cost or less Pale Moon follower from your banished zone",
          targets: [inYourZone("banished", { filter: (g, id) => followerThat(paleMoon)(g, id) && costAtMost(2)(g, id) })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
        {
          id: "2",
          label: "Pay 4: summon a Pale Moon follower from your banished zone",
          targets: [inYourZone("banished", { filter: followerThat(paleMoon) })],
          cost: playPointsCost(4),
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
