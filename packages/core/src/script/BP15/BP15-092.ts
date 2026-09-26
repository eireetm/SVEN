// BP15-092 Krampus — Abysscraft follower, 4, 4/4. 魔界.
// {[fanfare]} Bury another follower: Select an enemy follower on the field. Destroy it, give your leader
// {[defense]}+1, bury the top 2 cards of your deck, and draw a card. (A follower on your field, CR 10.4.3; not
// without a target; with one card left in the deck, it is buried and the draw loses — rulings.)
import { buryAnotherFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: buryAnotherFromYourField(isFollower),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.mill(2);
        yield* fx.draw(1);
      },
    }),
  ],
});
