// CP04-026 Creditta — Swordcraft follower, 4, 3/4. プリコネ・リッチモンド商工会.
// {[ub]} Activate {[engage]} this: Select an enemy follower on the field. For the rest of this turn, if it would take damage, it
// takes that much +2 instead. (Combat and ability damage; twice is +4; its player orders it with other changes, CR 10.10.2 —
// rulings.)
// {[fanfare]} Search your deck for a follower with "Pecorine" in its name, put it into your EX area, then shuffle. It costs 3 less
// to play this turn.
import { activated, defineCard, fanfare, ub } from "../helpers";
import { enemyFollower, isFollower, nameIncludes } from "../targets";
import { cheaperThisTurn } from "./shared";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.reduceDamage(fx.targets[0]![0]!, -2, "endOfTurn");
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        const found = yield* fx.search((id) => isFollower(fx.game, id) && nameIncludes("Pecorine")(fx.game, id), { to: "ex" });
        yield* cheaperThisTurn(fx, found, 3);
      },
    }),
  ],
});
