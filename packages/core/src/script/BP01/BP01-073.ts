// BP01-073 Fiery Embrace — Runecraft spell, 4. {[quick]}
// Select an enemy follower on the field and destroy it. Spellchain (10): Deal 3 damage to that
// follower's leader. (Needs a target — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const t = fx.targets[0]![0]!;
        const sc10 = fx.game.spellchain(fx.controller, 10); // fixed now (CR 13.3.1.4)
        const leader = fx.game.leader(fx.game.controller(t));
        yield* fx.destroy([t]);
        if (sc10) yield* fx.dealDamage(leader, 3);
      },
    }),
  ],
});
