// BP14-106 Magna Saber (Evolved) — Neutral follower, 5/5. 宴楽・機械・超克・マグナ.
// Ward.
// On Evolve - Select up to 2 enemy followers on the field and deal 5 damage divided between them.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], 5);
      },
    }),
  ],
});
