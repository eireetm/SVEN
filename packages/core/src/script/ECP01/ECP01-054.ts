// ECP01-054 Bring 'Em Home, Please! — Havencraft amulet, 2. ウマ娘・メジロ家.
// {[fanfare]} Select an enemy follower on the field and deal it damage equal to 2 times the number of Mejiro Family cards on your
// field. (This amulet counts.)
// Whenever a Mejiro McQueen is put onto your field, select an enemy follower on the field and deal it 3 damage. (Each copy
// triggers, once per card; on the opponent's turn too — rulings.)
// {[lastwords]} Select an unevolved Mejiro McQueen on your field and evolve it. (Without paying its Evolve cost and not counted as
// this turn's evolution; its controller may decline — rulings, CR 5.16.1.1.)
import { defineCard, fanfare, lastWords, whenCardEntersYourField } from "../helpers";
import { enemyFollower, isUnevolved, named, yourFollower } from "../targets";
import { mejiroOnYourField } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * mejiroOnYourField(fx.game, fx.controller));
      },
    }),
    whenCardEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { filter: named("Mejiro McQueen") },
    ),
    lastWords({
      targets: [yourFollower({ filter: (g, id) => named("Mejiro McQueen")(g, id) && isUnevolved(g, id) })],
      *resolve(fx) {
        yield* fx.evolve(fx.targets[0]![0]!);
      },
    }),
  ],
});
