// CP02-009 Yumi Aiba — Forestcraft follower, 3, 3/3. デレマス・パッション.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there are at least 3 Passion followers on your field, select an enemy follower on the field and deal it 2
// damage. (This follower counts.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { followersOnYourField, passion } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, c) => followersOnYourField(g, c, passion) >= 3,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
