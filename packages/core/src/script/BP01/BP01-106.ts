// BP01-106 Righteous Devil (Evolved) — 3/5.
// Assail. Bane. // Whenever an enemy follower is destroyed, deal 1 damage to its leader and give
// your leader +1 defense. (Also when this is destroyed at the same time; each copy — rulings.)
import { defineCard, whenEnemyFollowerDestroyed } from "../helpers";

export default defineCard({
  keywords: ["assail", "bane"],
  abilities: [
    whenEnemyFollowerDestroyed({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.data!.player!), 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
