// CP04-089 Eriko — Abysscraft follower, 1, 2/2. プリコネ・トワイライトキャラバン.
// {[ub]}{[fanfare]} Select an enemy follower on the field and deal it 1 damage. If {[ub]} abilities you control have executed at
// least 2 other times this turn, deal 3 damage instead.
import { defineCard, fanfare, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { otherUnionBursts } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, otherUnionBursts(fx) >= 2 ? 3 : 1);
        },
      }),
    ),
  ],
});
