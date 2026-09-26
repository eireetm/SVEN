// BP21-T03 Curse of Suffering — Runecraft spell token, 1. 魔法使い・学院・プリンセス.
// Deal 2 damage to each enemy leader, each enemy follower, and each Amaryllis, the Princess on your field. (At once, CR 5.14.)
import { defineCard, spell } from "../helpers";
import { named } from "../targets";

const amaryllis = named("Amaryllis, the Princess");

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const opponent = g.opponent(fx.controller);
        const mine = g.followers(fx.controller).filter((id) => amaryllis(g, id));
        yield* fx.dealDamageEach([g.leader(opponent), ...g.followers(opponent), ...mine], 2);
      },
    }),
  ],
});
