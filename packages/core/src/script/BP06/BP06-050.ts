// BP06-050 Charming Gentlemouse (Evolved) — Runecraft follower, 3/3. 魔法生物.
// On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number
// of cards named Charming Gentlemouse on your field.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const mice = fx.game.cards(fx.controller, "field").filter((id) => named("Charming Gentlemouse")(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * mice);
      },
    }),
  ],
});
