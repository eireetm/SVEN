// CP02-084 Syoko Hoshi (Evolved) — 3/2.
// At the start of your end phase, deal 1 damage to each enemy leader.
// {[lastwords]} Deal 1 damage to each enemy leader.
// (The evolved card has no "can't attack": an evolved follower has the evolved card's abilities, CR 5.16.1.2.)
import { atStartOfYourEndPhase, defineCard, lastWords } from "../helpers";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 1);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 1);
      },
    }),
  ],
});
