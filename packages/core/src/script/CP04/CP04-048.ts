// CP04-048 Chloe — Runecraft follower, 2, 3/2. プリコネ・なかよし部.
// {[ub]}{[fanfare]} Select an enemy follower on the field and deal it damage equal to the number of Friendship Club followers on
// your field. (This one included.)
// Whenever you play a Friendship Club card or PriConne spell, deal 1 damage to each enemy leader. (Also in an opponent's turn —
// ruling.)
import { defineCard, fanfare, ub, whenYouPlay } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemyLeader, followerThat, friendshipClub, priconneSpell } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          const n = fx.game.followers(fx.controller).filter((id) => followerThat(friendshipClub)(fx.game, id)).length;
          yield* fx.dealDamage(fx.targets[0]![0]!, n);
        },
      }),
    ),
    whenYouPlay(
      {
        *resolve(fx) {
          yield* damageEnemyLeader(fx, 1);
        },
      },
      (g, card) => friendshipClub(g, card) || priconneSpell(g, card),
    ),
  ],
});
