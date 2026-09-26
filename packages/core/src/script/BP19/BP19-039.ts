// BP19-039 Sephie, Depraved Convict (Evolved) — 4/4.
// On Evolve - Choose 1. If there are at least 10 Condemned followers in your cemetery, choose up to 2 instead. (1) Select an
// enemy follower on the field and deal it 5 damage. (2) Summon a Multi-Headed Test Subject token. (Each once; (1) needs its
// target — rulings, CR 5.18.)
// On Super-Evolve - Select up to 2 Volunteer Test Subject or Multi-Headed Test Subject on your field and give them Storm.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { condemnedInCemetery, MULTI_HEADED } from "./shared";
import { testSubject } from "./shared-rune";

export default defineCard({
  abilities: [
    onEvolve({
      modeCount: (g, c) => (condemnedInCemetery(g, c) >= 10 ? 2 : 1),
      modes: [
        {
          id: "damage",
          label: "(1) 5 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          },
        },
        {
          id: "summon",
          label: "(2) Summon a Multi-Headed Test Subject",
          *resolve(fx) {
            yield* fx.summon([MULTI_HEADED]);
          },
        },
      ],
    }),
    onSuperEvolve({
      targets: [yourFollower({ count: 2, upTo: true, filter: testSubject })],
      *resolve(fx) {
        for (const id of fx.targets[0]!) yield* fx.giveKeyword(id, "storm");
      },
    }),
  ],
});
