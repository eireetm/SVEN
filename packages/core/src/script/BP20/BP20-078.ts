// BP20-078 Diabolus Hedone — Abysscraft follower, 3, 4/4. 魔界.
// {[fanfare]} Select up to 2 enemy followers on the field and, if Sanguine is active for you, destroy them.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        const targets = fx.targets[0] ?? [];
        if (targets.length > 0 && fx.game.sanguine(fx.controller)) yield* fx.destroy(targets);
      },
    }),
  ],
});
