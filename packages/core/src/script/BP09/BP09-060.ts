// BP09-060 Roy, Dragoncleaver (Evolved) — Dragoncraft follower, 3/3. 武闘竜人・キラー.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If it's a Wyrmkin follower,
// deal 5 damage instead.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { wyrmkin } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamage(target, wyrmkin(fx.game, target) ? 5 : 2);
      },
    }),
  ],
});
