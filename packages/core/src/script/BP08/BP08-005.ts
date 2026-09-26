// BP08-005 Zwei, Murderous Puppet (Evolved) — Forestcraft follower, 4/4. 人形・キラー.
// On Evolve - Select a Victoria on your field. It doesn't take damage this turn.
import { defineCard, onEvolve } from "../helpers";
import { named, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [yourFollower({ filter: named("Victoria") })],
      *resolve(fx) {
        yield* fx.preventDamage(fx.targets[0]![0]!, "all", "endOfTurn");
      },
    }),
  ],
});
