// CP04-094 Akino — Havencraft follower, 7, 6/6. プリコネ・メルクリウス財団.
// {[ub]} Activate {[engage]} this: Select up to 2 enemy followers on the field and deal them damage equal to the number of cards in
// your hand.
// Ward.
// {[fanfare]} Give your leader {[defense]}+3. Draw 3 cards.
import { activated, defineCard, fanfare, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [enemyFollower({ count: 2, upTo: true })],
          *resolve(fx) {
            yield* fx.dealDamageEach(fx.targets[0]!, fx.game.cards(fx.controller, "hand").length);
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.draw(3);
      },
    }),
  ],
});
