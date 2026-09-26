// BP12-078 Hellfire Hound — Abysscraft follower, 4, 4/4. 魔界・獣.
// {[fanfare]} Banish 6 cards from your cemetery: Select any number of enemy followers on the field and
// deal 6 damage divided between them. (Each selected follower gets at least 1, BP08-028 ruling.)
import { defineCard, fanfare } from "../helpers";
import { banishFromYour } from "../costs";
import { ANY, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYour(["cemetery"], () => true, 6),
      targets: [enemyFollower({ count: ANY, upTo: true, max: () => 6 })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0]!, 6);
      },
    }),
  ],
});
