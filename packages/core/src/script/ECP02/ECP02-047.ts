// ECP02-047 Ranko Kanzaki [Cinderella Girl] — Abysscraft follower, 5, 5/5. デレマス・クール.
// Ward.
// {[fanfare]} Select an enemy follower on the field and destroy it. Necrocharge (5) - Give your leader {[defense]}+3. NC (10) - Deal
// 3 damage to each enemy leader. (CR 13.5.1; the count is fixed when the effect begins to resolve, 13.5.1.3.2. Not playable
// without an enemy follower to select — ruling.)
// Activate, Lesson (1): Draw a card. Activate only once per turn.
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const nc5 = fx.game.necrocharge(fx.controller, 5);
        const nc10 = fx.game.necrocharge(fx.controller, 10);
        yield* fx.destroy(fx.targets[0]!);
        if (nc5) yield* fx.giveLeaderDefense(fx.controller, 3);
        if (nc10) yield* damageEnemyLeader(fx, 3);
      },
    }),
    activated(
      { custom: lesson(1) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
