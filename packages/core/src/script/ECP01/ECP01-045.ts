// ECP01-045 TT Ignition! — Abysscraft spell, 5. ウマ娘.
// Bury the top 4 cards of your deck. Deal damage to each follower on the field equal to the number of Umamusume cards buried
// this way.
import { defineCard, spell } from "../helpers";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const buried = yield* fx.mill(4);
        const n = buried.filter((id) => umamusume(g, id)).length;
        yield* fx.dealDamageEach([...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))], n);
      },
    }),
  ],
});
