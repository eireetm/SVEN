// CP04-109 Omniscient Kaiser — Neutral follower, 7, 6/6. プリコネ・七冠.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard 2 PriConne cards: Draw 2 cards. Each opponent discards 2 cards. (As many as they have.)
import { discardMatching } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { priconne } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: discardMatching(priconne, 2),
      *resolve(fx) {
        yield* fx.draw(2);
        const opp = fx.game.opponent(fx.controller);
        const n = Math.min(2, fx.game.cards(opp, "hand").length);
        yield* fx.discard(opp, n, n);
      },
    }),
  ],
});
