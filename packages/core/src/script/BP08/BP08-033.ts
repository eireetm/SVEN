// BP08-033 Mana Pistol Merc (Evolved) — Swordcraft follower, 6/5. 傭兵・超克.
// On Evolve: select an enemy follower and deal it 6 damage. CR 5.14, 12.6.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [onEvolve({ targets: [enemyFollower()], *resolve(fx) { yield* fx.dealDamage(fx.targets[0]![0]!, 6); } })],
});
