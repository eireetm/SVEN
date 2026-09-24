// BP05-067 Colossal Construct — Dragoncraft follower, 7, 6/7. 巨人・超克.
// Ward.
// {[fanfare]} Return 5 cards from your cemetery to your deck and shuffle it: Select an enemy
// follower on the field and deal it 5 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: {
        canPay: (g, c) => g.cards(c, "cemetery").length >= 5,
        *pay(fx) {
          const chosen = yield* fx.chooseCards(fx.game.cards(fx.controller, "cemetery"), 5, 5);
          yield* fx.putOnDeck(chosen, "top");
          yield* fx.shuffleDeck();
        },
      },
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
