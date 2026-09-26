// BP13-032 Mona, Levin Mage — Swordcraft follower, 1, 2/2. 兵士・レヴィオン.
// Ward.
// {[fanfare]} Discard a Levin card: Draw a card.
// At the start of your end phase, if there are at least 5 Levin cards in your cemetery, give your leader
// {[defense]}+1.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { countIn, levin } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: discardA(levin),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, p) => countIn(g, p, "cemetery", levin) >= 5,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
