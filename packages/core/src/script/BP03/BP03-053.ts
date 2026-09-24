// BP03-053 Blitz — Runecraft spell, 1. チェス.
// Deal X to an enemy follower. X equals cards named Magical Pawn on your field, plus 2.
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const pawns = fx.game.cards(fx.controller, "field").filter((id) => named("Magical Pawn")(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, pawns + 2);
      },
    }),
  ],
});
