// CP04-108 Amped on Acorns — Havencraft amulet, 1. プリコネ・エリザベスパーク.
// {[fanfare]} Look at the top card of your deck. If it's a PriConne card, you may reveal it and add it to your hand. (Not taken, it
// stays on top, unrevealed — ruling.)
// Whenever this becomes engaged, give your leader {[defense]}+1.
import { defineCard, fanfare, whenThisBecomesEngaged } from "../helpers";
import { mayTakeTopCard, priconne } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, priconne);
      },
    }),
    whenThisBecomesEngaged({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
