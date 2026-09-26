// BP20-116 Inspirational One — Neutral follower, 2, 2/3. 光輝.
// Ward.
// {[fanfare]} Select an enemy follower on the field. If you don't have a Super Evolution Point, deal it 5 damage and give your
// leader {[defense]}+2. (Without a target, none of it; SEP starts at 1 — rulings.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { noSuperEvolutionPoint } from "./shared-neutral";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (!noSuperEvolutionPoint(fx.game, fx.controller)) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
