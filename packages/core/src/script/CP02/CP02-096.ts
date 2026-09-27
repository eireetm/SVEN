// CP02-096 Psychic☆Maiden — Havencraft amulet, 3. デレマス・パッション.
// {[fanfare]} Select an enemy follower with 4 defense or less on the field and banish it. (Its defense when the Fanfare is
// played: an ability resolved before it may lower it — ruling.)
// {[act]} {[cost05]}, {[engage]}, bury this card: Select an enemy follower on the field and banish it.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 4 })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
    activated(
      { playPoints: 5, engageSelf: true, burySelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.banish(fx.targets[0]!);
        },
      },
    ),
  ],
});
