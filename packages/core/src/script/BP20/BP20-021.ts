// BP20-021 Sinciro, Heir to Usurpation (Evolved) — 4/4.
// This deals 2 additional ability damage for each fusion counter on it. (A replacement effect, CR 5.14.2: with other
// increases and reductions, the player taking the damage chooses the order — rulings, CR 10.10.2.)
// On Evolve - Select an enemy follower on the field and deal it 3 damage.
// On Super Evolve - Deal each enemy leader and enemy follower on the field 1 damage.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  field: { damageDealt: (g, self, d) => (d.kind === "ability" ? 2 * g.counters(self, "fusion") : 0) },
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], 1);
      },
    }),
  ],
});
