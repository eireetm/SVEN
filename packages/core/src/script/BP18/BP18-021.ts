// BP18-021 Shinra, All Discerning (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field and deal it 3 damage. If there are at least 3 Togh Keyoh cards on your
// field, deal 4 damage instead.
// On Super-Evolve - Put an All-Access Search token into your EX area.
// Activate {[engage]} this, remove 10 gigabyte counters from a Gigabyte Blade on your field: Deal 8 damage to each enemy
// leader. (Not without the counters — ruling.)
import { activated, defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { drainBlade, toghKeyohOnField } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, toghKeyohOnField(fx.game, fx.controller) >= 3 ? 4 : 3);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["All-Access Search"]);
      },
    }),
    activated(
      { engageSelf: true, custom: drainBlade },
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 8);
        },
      },
    ),
  ],
});
