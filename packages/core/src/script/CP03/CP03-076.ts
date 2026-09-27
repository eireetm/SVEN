// CP03-076 Embodiment of Spear, Tahr — Dragoncraft follower, 2, 3/1. ヴァンガード・かげろう. Critical Trigger.
// Rush. Assail.
// {[fanfare]} If Overflow is active for you, deal 2 damage to each enemy leader. (effect_en lacks "damage".)
// ----------
// (If this card is revealed by a drive check, give a follower on your field {[attack]}+2.) (Resolved by the engine.)
import { defineCard, fanfare } from "../helpers";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    fanfare({
      condition: (g, c) => g.overflow(c),
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 2);
      },
    }),
  ],
});
