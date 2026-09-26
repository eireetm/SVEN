// BP14-119 Goblin Assault — Neutral spell, 2. ゴブリン.
// When playing this, discard a Goblinoid card: This costs 2 less to play. (CR 10.4.7.3)
// ----------
// Select an enemy follower on the field and deal it 3 damage.
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { goblin } from "./shared";

export default defineCard({
  playOptions: [{ id: "discard", label: "Discard a Goblinoid card: 2 less", ...discardA(goblin), costDelta: -2 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
