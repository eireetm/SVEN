// BP20-011 Greatwood Warrior — Forestcraft follower, 4, 4/4. 狩人.
// {[fanfare]} Search your deck for up to 2 {[forestcraft]} spells with different names, reveal them, add them to your hand,
// then shuffle.
import { defineCard, fanfare } from "../helpers";
import { isClass, isSpell } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isSpell(g, id) && isClass("Forestcraft")(g, id), { max: 2, distinctNames: true });
      },
    }),
  ],
});
