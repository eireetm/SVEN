// CP04-035 Ninon — Swordcraft follower, 2, 2/2. プリコネ・ヴァイスフリューゲル.
// {[ub]} Activate {[cost04]}, engage this: Select an enemy follower on the field. Deal it 5 damage and refresh this. Activate only
// once per turn. (Without an enemy follower it can't be activated — ruling.)
// Whenever a {[ub]} ability of another follower on your field is executed, give this {[attack]}+1/{[defense]}+1.
import { activated, defineCard, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      activated(
        { playPoints: 4, engageSelf: true },
        {
          oncePerTurn: true,
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 5);
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
          },
        },
      ),
    ),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
