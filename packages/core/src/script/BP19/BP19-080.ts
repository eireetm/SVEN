// BP19-080 Myroel, Death Enforcer — Abysscraft follower, 7, 5/5. 八獄・魔界.
// Whenever a follower on your field is summoned, if it was summoned from the cemetery, deal 1 damage to each enemy follower
// on the field. (Put onto your field from the cemetery — the Japanese and official English texts; this one too; on the
// opponent's turn too; two of these, two triggers — rulings.)
// {[fanfare]} Discard a Condemned card: Draw a card. (CR 10.4.7.4.)
// Activate {[engage]} this: Select a 5-cost or lower Condemned follower and a 3-cost or lower Condemned follower from your
// cemetery and summon them. (Up to 1 of each — the Japanese, Chinese and official English texts; 元のコスト.)
import { discardA } from "../costs";
import { activated, defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { condemned, condemnedFollower } from "./shared";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
        },
      },
      { filter: (g, id) => g.enteredFrom(id) === "cemetery" },
    ),
    fanfare({
      cost: discardA(condemned),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [
          inYourZone("cemetery", { upTo: true, filter: and(condemnedFollower, costAtMost(5)) }),
          inYourZone("cemetery", { upTo: true, distinct: true, filter: and(condemnedFollower, costAtMost(3)) }),
        ],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets.flat());
        },
      },
    ),
  ],
});
