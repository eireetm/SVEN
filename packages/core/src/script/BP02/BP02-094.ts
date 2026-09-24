// BP02-094 Tribunal of Good and Evil — Havencraft amulet, 5.
// {[fanfare]} Select an enemy follower on the field and destroy it.
// {[act]}{[engage]}, put this card into your cemetery: Draw a card.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
