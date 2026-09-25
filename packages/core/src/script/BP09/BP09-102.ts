// BP09-102 Moriae Encomium — Havencraft amulet, 2. 狂信.
// {[fanfare]} Draw a card.
// {[lastwords]} Select an enemy follower with 3 defense or less on the field and destroy it.
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    lastWords({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 3 })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
