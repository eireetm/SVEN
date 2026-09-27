// ECP01-053 Mejiro Palmer [Moonlit Devil♪] — Havencraft follower, 1, 2/1. ウマ娘・メジロ家.
// {[feed]} {[cost01]}: Race this follower.
// Storm.
// This card doesn't refresh during your start phase. (CR 7.2.3.)
// At the start of your main phase, {[cost01]}: Refresh this card. (The cost may be left unpaid; the main phase comes after
// everything of the start phase — rulings; CR 10.4.7.4.)
import { playPointsCost } from "../costs";
import { atStartOfYourMainPhase, defineCard, serveAbility } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  noStartPhaseRefresh: true,
  abilities: [
    serveAbility(1, 1),
    atStartOfYourMainPhase({
      cost: playPointsCost(1),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
