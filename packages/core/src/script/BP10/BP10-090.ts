// BP10-090 Soul Box — Abysscraft follower, 7, 5/4. 魔界.
// Rush.
// {[fanfare]} Select an enemy follower on the field and, if there's a spell in your cemetery, destroy
// it.
// {[fanfare]} If there's an amulet on your field, deal 5 damage to each enemy leader.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, isAmulet, isSpell } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "cemetery").some((id) => isSpell(fx.game, id))) yield* fx.destroy(fx.targets[0]!);
      },
    }),
    fanfare({
      condition: (g, p) => g.cards(p, "field").some((id) => isAmulet(g, id)),
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 5);
      },
    }),
  ],
});
