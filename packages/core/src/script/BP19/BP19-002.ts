// BP19-002 Magachiyo, Barbed Convict (Evolved) — 3/3.
// Storm.
// On Evolve - Select an enemy follower on the field. Combo (3) - Deal it 4 damage. (Combo is checked as it resolves, CR
// 13.2.1.2.)
// On Super-Evolve - Give each other Condemned follower on your field Storm.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { condemnedFollower } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.combo(fx.controller, 3)) yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller).filter((c) => c !== fx.self && condemnedFollower(fx.game, c))) {
          yield* fx.giveKeyword(id, "storm");
        }
      },
    }),
  ],
});
