// CP02-058 Tsukasa Kiryu (Evolved) — 6/6.
// On Evolve - Select an enemy follower on the field and destroy it. If you have 10 max play points, deal 3 damage to its
// leader. (Without an enemy follower nothing happens — ruling, CR 10.6.2.3.3.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { maxPlayPointsTen } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        if (maxPlayPointsTen(fx.game, fx.controller)) yield* fx.dealDamage(leader, 3);
      },
    }),
  ],
});
