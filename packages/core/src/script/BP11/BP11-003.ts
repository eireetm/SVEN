// BP11-003 Shamu & Shama, Posh Felines — Forestcraft follower, 1, 1/1. 狩人・獣.
// Storm.
// {[fanfare]} Select an enemy follower on the field. Combo (5) - Deal it 3 damage.
// Strike, Combo (3) - Give this follower {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.combo(fx.controller, 5)) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    strike({
      condition: (g, p) => g.combo(p, 3),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
