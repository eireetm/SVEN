// CP04-097 Clear — Havencraft follower, 2, 3/2. プリコネ・アルターメイデン.
// {[ub]}{[fanfare]} Deal 1 damage to each enemy leader.
// Whenever a {[ub]} ability of another follower on your field is executed, deal 1 damage to each enemy leader. (Also in an
// opponent's turn; an ability executed by CP04-114 counts as well as CP04-114's own — rulings.)
import { defineCard, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          yield* damageEnemyLeader(fx, 1);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 1);
      },
    }),
  ],
});
