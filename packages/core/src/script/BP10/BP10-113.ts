// BP10-113 Fieran, Havensent Wind God — Neutral follower, 4, 2/2. 大神.
// This card costs 3 less to play from the EX area.
// ----------
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
// At the start of your end phase, give each other follower on your field {[attack]}+1.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playCost: (g, self) => (g.playZone(self) === "ex" ? -3 : 0),
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) if (id !== fx.self) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});
