// BP15-039 Lishenna, Melodious Destruction — Runecraft follower, 3, 3/3. 絶傑・アイドル.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there are at least 3 Idolatry cards on your field, put a Melodious Monody token into your EX area.
// (This one counts.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { countIn, idolatry } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => countIn(g, p, "field", idolatry) >= 3,
      *resolve(fx) {
        yield* fx.tokensToEx(["Melodious Monody"]);
      },
    }),
  ],
});
