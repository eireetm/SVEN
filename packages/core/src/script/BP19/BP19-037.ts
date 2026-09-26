// BP19-037 Cannon Volley — Swordcraft spell, 3. 兵士.
// Select an enemy follower on the field. Summon a Shield Guardian and a Knight token. Deal damage to the selected follower
// equal to the number of {[swordcraft]} followers on your field. (With room for one the player picks; not playable without a
// target — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isClass } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.summon(["Shield Guardian", "Knight"]);
        const n = fx.game.followers(fx.controller).filter((id) => isClass("Swordcraft")(fx.game, id)).length;
        if (n > 0) yield* fx.dealDamage(fx.targets[0]![0]!, n);
      },
    }),
  ],
});
