// CP02-067 Noa Takamine (Evolved) — 5/5.
// On Evolve - Select an enemy follower on the field and deal it damage equal to your max play points.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.state.players[fx.controller].maxPlayPoints);
      },
    }),
  ],
});
