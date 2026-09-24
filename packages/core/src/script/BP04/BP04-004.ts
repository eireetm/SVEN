// BP04-004 Deepwood Anomaly (Evolved) — Forestcraft, 10/10.
// On Evolve: Select an enemy follower on the field and put it on the bottom of its owner's deck
// (a token is removed instead, CR 9.1.4).
// When this follower deals attack damage to an enemy leader, you win the game (CR 5.23.1).
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { winOnLeaderAttackDamage } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putOnDeck(fx.targets[0]!, "bottom");
      },
    }),
    winOnLeaderAttackDamage,
  ],
});
