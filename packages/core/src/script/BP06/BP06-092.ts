// BP06-092 Karula, Arts Master (Evolved) — Havencraft follower, 4/4. 挑戦者・信仰.
// At the start of your end phase, recover 2 play points. Then, if you have at least 2 play points,
// deal 2 damage to each enemy leader. If you have at least 4, draw a card. If you have at least 6,
// select up to 1 enemy follower on the field and destroy it.
// Rulings: the "up to 1" follower is selected when the ability is played, before drawing or
// recovering (CR 10.6.2.3); the play points are counted when each part happens.
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { karulaStrikes, playPointsOf } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      // The selection is needed if 6 can be reached after recovering 2 (never above the maximum).
      targets: [
        enemyFollower({
          upTo: true,
          when: (g, c) => Math.min(playPointsOf(g, c) + 2, g.state.players[c].maxPlayPoints) >= 6,
        }),
      ],
      *resolve(fx) {
        yield* fx.recoverPlayPoints(2);
        yield* karulaStrikes(fx);
      },
    }),
  ],
});
