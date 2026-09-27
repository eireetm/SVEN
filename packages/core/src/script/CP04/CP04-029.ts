// CP04-029 Shizuru — Swordcraft follower, 3, 2/4. プリコネ・ラビリンス.
// {[ub]} Activate {[engage]} this: Select an enemy follower on the field. Deal it 1 damage and give your leader {[defense]}+1.
// Ward.
// {[fanfare]} Search your deck for a 1-cost PriConne follower with {[evolve]}, put it into your EX area, then shuffle. (元のコスト.)
import { activated, defineCard, fanfare, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { costs, priconneFollower } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 1);
            yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => priconneFollower(g, id) && costs(1)(g, id) && g.hasEvolveAbility(g.card(id)!.def), { to: "ex" });
      },
    }),
  ],
});
