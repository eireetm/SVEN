// BP08-098 Zealot of Repose — Havencraft follower, 4, 0/4. 絶傑・狂信・キラー.
// At the start of each opponent's main phase, select an enemy follower with 4 defense or less and
// destroy it. Multiple copies become pending together (ruling; CR 10.7.3.1).
import { atStartOfOpponentsMainPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfOpponentsMainPhase({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 4 })],
      *resolve(fx) { yield* fx.destroy(fx.targets[0] ?? []); },
    }),
  ],
});
