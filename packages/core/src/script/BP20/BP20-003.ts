// BP20-003 Krulle, Heir to Unkilling (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field and give it {[attack]}-3/{[defense]}-3.
// On Super Evolve - Give each enemy follower on the field {[attack]}-3/{[defense]}-3.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -3, -3);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.game.opponent(fx.controller))) yield* fx.giveStats(id, -3, -3);
      },
    }),
  ],
});
