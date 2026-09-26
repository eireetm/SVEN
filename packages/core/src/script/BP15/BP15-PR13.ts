// BP15-PR13 Fangs of Ardent Destruction — Dragoncraft spell token, 1. 絶傑・竜族.
// Deal 1 damage to each follower on the field. If Overflow is active for you, give each Galmieux, Ardent Disdain
// on your field Storm.
import { defineCard, spell } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.dealDamageEach([...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))], 1);
        if (!g.overflow(fx.controller)) return;
        for (const id of g.followers(fx.controller)) if (named("Galmieux, Ardent Disdain")(g, id)) yield* fx.giveKeyword(id, "storm");
      },
    }),
  ],
});
