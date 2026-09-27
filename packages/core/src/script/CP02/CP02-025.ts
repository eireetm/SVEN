// CP02-025 Anzu Futaba — Swordcraft follower, 1, 3/2. デレマス・キュート.
// {[fanfare]} If there are 2 iM@S CG followers or less on your field, engage this card. (This follower counts.)
// This card doesn't refresh during your start phase. (CR 7.2.3.)
// At the start of your main phase, {[cost02]}: Refresh this card. (The cost may be left unpaid — ruling; CR 10.4.7.4.)
import { playPointsCost } from "../costs";
import { atStartOfYourMainPhase, defineCard, fanfare } from "../helpers";
import { followersOnYourField, imas } from "./shared";

export default defineCard({
  noStartPhaseRefresh: true,
  abilities: [
    fanfare({
      condition: (g, c) => followersOnYourField(g, c, imas) <= 2,
      *resolve(fx) {
        yield* fx.engage([fx.self]);
      },
    }),
    atStartOfYourMainPhase({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
