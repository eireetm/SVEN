// ECP01-042 K.S. Miracle — Abysscraft follower, 2, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Ward.
// At the start of your main phase, destroy this card.
// {[lastwords]} Discard an Umamusume card: Draw a card.
import { discardA } from "../costs";
import { atStartOfYourMainPhase, defineCard, lastWords, serveAbility } from "../helpers";
import { umamusume } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    atStartOfYourMainPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.destroy([fx.self]);
      },
    }),
    lastWords({
      cost: discardA(umamusume),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
