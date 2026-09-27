// ECP01-003 Sakura Laurel — Forestcraft follower, 3, 2/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Select an enemy follower on the field and, if there's another Umamusume card on your field, deal it 4 damage.
// Activate {[engage]}: Give this follower {[attack]}+2/{[defense]}+2 and Ward. Give your leader {[defense]}+2. Activate only if
// there are 5 Umamusume cards on your field. (「5枚なら」.)
import { activated, defineCard, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { umamusume, umamusumeOnYourField } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const g = fx.game;
        if (g.cards(fx.controller, "field").some((id) => id !== fx.self && umamusume(g, id))) yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => umamusumeOnYourField(g, c) === 5,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") {
            yield* fx.giveStats(fx.self, 2, 2);
            yield* fx.giveKeyword(fx.self, "ward");
          }
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
    ),
  ],
});
