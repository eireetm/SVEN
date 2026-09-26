// BP14-003 Levon, Scentbound Sword — Forestcraft follower, 5, 4/4. 狩人.
// Activate {[engage]} this: Select an enemy follower on the field. Deal it 4 damage, draw a card, and, if
// there are at least 3 Hunter cards in your cemetery, you may summon a Hunter follower that costs 3 or less
// from your hand. (元のコスト; not played without a target — ruling.)
import { activated, defineCard } from "../helpers";
import { and, costAtMost, enemyFollower, isFollower } from "../targets";
import { countIn, hunter } from "./shared";

const cheapHunter = and(isFollower, hunter, costAtMost(3));

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          yield* fx.draw(1);
          if (countIn(fx.game, fx.controller, "cemetery", hunter) < 3) return;
          const cards = fx.game.cards(fx.controller, "hand").filter((id) => cheapHunter(fx.game, id));
          yield* fx.putOntoField(yield* fx.chooseCards(cards, 0, 1));
        },
      },
    ),
  ],
});
