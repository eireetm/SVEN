// CP04-006 Shiori (Evolved) — Forestcraft, 3/3. プリコネ・エリザベスパーク.
// {[ub]} On Evolve - Deal 2 damage to each enemy leader.
import { defineCard, onEvolve, ub } from "../helpers";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        *resolve(fx) {
          yield* damageEnemyLeader(fx, 2);
        },
      }),
    ),
  ],
});
