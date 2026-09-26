// BP18-100 Elana, Purest Prayer — Havencraft follower, 2, 2/2. 信仰.
// Ward.
// {[fanfare]} Search your deck for an Elana's Prayer, reveal it, add it to your hand, then shuffle.
// At the start of each opponent's main phase, if there's an Elana's Prayer on your field, give your leader {[defense]}+2.
import { atStartOfOpponentsMainPhase, defineCard, fanfare } from "../helpers";
import { named } from "../targets";

const prayer = named("Elana's Prayer");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => prayer(fx.game, id));
      },
    }),
    atStartOfOpponentsMainPhase({
      condition: (g, c) => g.cards(c, "field").some((id) => prayer(g, id)),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
