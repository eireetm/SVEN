// BP16-T04 Mimi, Right Paw Hellhound — Abysscraft follower token, 1, 2/2. 魔界.
// {[lastwords]} Select an enemy follower on the field. Deal it 2 damage and bury the top card of your deck. (Without a
// target it can't be played, so nothing is buried — ruling.)
import { defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        yield* fx.mill(1);
      },
    }),
  ],
});
