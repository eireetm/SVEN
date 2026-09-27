// CP04-077 Shinobu — Abysscraft follower, 3, 3/3. プリコネ・ディアボロス.
// {[ub]}{[fanfare]} Select an enemy follower on the field and deal it damage equal to the number of Diabolos followers on your field.
// (This one included.)
// {[evolve]} {[cost01]}: Evolve this.
// Whenever a {[ub]} ability of another follower on your field is executed, bury the top card of your deck.
import { defineCard, evolveAbility, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { enemyFollower } from "../targets";
import { diabolos, followerThat } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          const n = fx.game.followers(fx.controller).filter((id) => followerThat(diabolos)(fx.game, id)).length;
          yield* fx.dealDamage(fx.targets[0]![0]!, n);
        },
      }),
    ),
    evolveAbility(1),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
