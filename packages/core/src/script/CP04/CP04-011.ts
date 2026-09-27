// CP04-011 Cleuru — Forestcraft follower, 2, 0/4. プリコネ・〈ジオ・テオゴニア〉.
// {[ub]} Activate Remove 2 Bunclie counters from this: Give your leader {[defense]}+2. Draw a card.
// {[fanfare]} If this wasn't put onto the field from hand, place 2 Bunclie counters on it. (From the EX area, deck or cemetery —
// ruling.)
// At the start of your end phase, place a Bunclie counter on this.
import { removeCountersFromThis } from "../costs";
import { activated, atStartOfYourEndPhase, defineCard, fanfare, ub } from "../helpers";

const BUNCLIE = "bunclie";

export default defineCard({
  abilities: [
    ub(
      activated(
        { custom: removeCountersFromThis(BUNCLIE, 2) },
        {
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 2);
            yield* fx.draw(1);
          },
        },
      ),
    ),
    fanfare({
      condition: (g, _c, self) => g.enteredFrom(self) !== "hand",
      *resolve(fx) {
        yield* fx.addCounters(fx.self, BUNCLIE, 2);
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, BUNCLIE, 1);
      },
    }),
  ],
});
