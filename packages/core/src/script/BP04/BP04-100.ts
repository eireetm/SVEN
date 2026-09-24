// BP04-100 Dark Jeanne (Evolved) — Havencraft, 6/6.
// On Evolve: If your leader's defense is at least 5, select an enemy follower on the field. Deal 4
// damage to it and each leader (your leader too; without an enemy follower to select nothing
// happens — ruling).
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      condition: (g, p) => g.state.players[p].leaderDefense >= 5,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamages([
          { target: fx.targets[0]![0]!, amount: 4 },
          { target: fx.game.leader(fx.controller), amount: 4 },
          { target: fx.game.leader(fx.game.opponent(fx.controller)), amount: 4 },
        ]);
      },
    }),
  ],
});
