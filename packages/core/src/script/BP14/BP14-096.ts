// BP14-096 Winged Gatekeeper (Evolved) — Havencraft follower, 3/3. 宴楽・狂信・鳥族.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
// Whenever your leader gains {[defense]}, deal 1 damage to each enemy leader. (Also during the opponent's turn —
// ruling.)
import { defineCard, onEvolve, whenYourLeaderGainsDefense } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    whenYourLeaderGainsDefense({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
      },
    }),
  ],
});
