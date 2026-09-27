// CP04-111 Misora — Neutral follower, 6, 6/6. プリコネ・〈レイジ・レギオン〉.
// {[ub]}{[fanfare]} Select any number of enemy followers on the field and deal 8 damage divided between them. (At least 1 each, so at
// most 8; with none it selects 0 and is executed — ruling.)
// {[lastwords]} Search your deck for a 4-cost PriConne follower, put it into your EX area, then shuffle. (元のコスト.)
import { defineCard, fanfare, lastWords, ub } from "../helpers";
import { ANY, enemyFollower } from "../targets";
import { costs, priconneFollower } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower({ count: ANY, upTo: true, max: () => 8 })],
        *resolve(fx) {
          if (fx.targets[0]!.length > 0) yield* fx.dealDividedDamage(fx.targets[0]!, 8);
        },
      }),
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.search((id) => priconneFollower(fx.game, id) && costs(4)(fx.game, id), { to: "ex" });
      },
    }),
  ],
});
