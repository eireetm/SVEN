// BP21-076 Vulgus, Infernal Headmistress — Abysscraft follower, 3, 2/2. 魔界・学院.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal an Academic card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order. The next Academic card that costs 2 or less you play this turn
// costs 2 less. (元のコスト.)
// Activate {[engage]} this, bury another card on your field: Select an enemy follower on the field. Deal it 3 damage and
// draw a card. Activate only if you rolled a 6-sided die this turn. (Also a roll before this was on the field; needs a
// target — rulings.)
import { buryAnotherFromYourField } from "../costs";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";
import { academic } from "./shared";

export default defineCard({
  nextPlay: { academic: (g, card) => academic(g, card) && costAtMost(2)(g, card) },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: academic, to: "hand" });
        yield* fx.nextPlayCostsLess("academic", 2);
      },
    }),
    activated(
      { engageSelf: true, custom: buryAnotherFromYourField() },
      {
        condition: (g, c) => g.diceRolledThisTurn(c).length > 0,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
