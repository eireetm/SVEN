// BP10-094 X. Slaus, Wheel of Fortune — Havencraft follower, 2, 2/2. アルカナ・信仰.
// {[fanfare]} {[cost02]} Search your deck for a Wheel of Misfortune, put it into your EX area, then
// shuffle.
// Whenever a card is put into your EX area, {[engage]}: Select an enemy follower on the field and
// destroy it. (Also during the opponent's turn — ruling.)
import { engageThis, playPointsCost } from "../costs";
import { defineCard, fanfare, whenCardPutIntoYourEx } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.search((id) => named("Wheel of Misfortune")(fx.game, id), { to: "ex" });
      },
    }),
    whenCardPutIntoYourEx({
      cost: engageThis,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
