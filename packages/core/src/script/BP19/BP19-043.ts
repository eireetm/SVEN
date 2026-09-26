// BP19-043 Obsessive Scholar (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 3 damage.
// Activate {[engage]} this: Select a Volunteer Test Subject or Multi-Headed Test Subject on your field and give it Drain.
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { testSubject } from "./shared-rune";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [yourFollower({ filter: testSubject })],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "drain");
        },
      },
    ),
  ],
});
