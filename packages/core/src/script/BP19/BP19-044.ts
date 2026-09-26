// BP19-044 Warden of the Trigger — Runecraft follower, 2, 3/2. 八獄・機械.
// {[fanfare]} Look at the top card of your deck. If it's a Machina card, you may put it into your EX area. (Not taken, it
// stays on top, unrevealed — ruling.)
// Activate {[engage]} this: Select an enemy follower on the field and destroy it. Activate only if you have a 6-cost or
// greater Machina follower on your field. (元のコスト.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(1);
        const chosen = yield* fx.selectCards(top.filter((id) => machina(fx.game, id)), 0, 1, fx.controller, top);
        if (chosen.length > 0) yield* fx.putIntoEx(chosen);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.followers(c).some((id) => machina(g, id) && (g.info(id).cost ?? 0) >= 6),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});
