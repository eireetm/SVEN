// BP09-113 Divine Retribution — Neutral spell, 4. 大神. Quick.
// Select an enemy follower on the field. Destroy it and, if there's an evolved follower on your field,
// put this card into its owner's EX area. (Its owner's; with a full EX area it goes to the cemetery; an
// evolved amulet doesn't count — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isEvolved } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        const evolved = fx.game.followers(fx.controller).some((id) => isEvolved(fx.game, id));
        if (evolved && fx.game.card(fx.self)?.zone === "resolution") yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
