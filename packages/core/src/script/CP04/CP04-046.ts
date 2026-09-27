// CP04-046 Kyoka (Evolved) — Runecraft, 3/3. プリコネ・リトルリリカル.
// {[ub]} On Evolve - Select an enemy follower on the field. Deal it 2 damage and, if you've played a spell this turn, deal 2
// damage to its leader.
import { defineCard, onEvolve, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const leader = fx.game.leader(fx.game.controller(target));
          yield* fx.dealDamage(target, 2);
          const g = fx.game;
          if (g.cardsPlayedThisTurn(fx.controller).some((def) => g.db.get(def).type === "spell")) yield* fx.dealDamage(leader, 2);
        },
      }),
    ),
  ],
});
