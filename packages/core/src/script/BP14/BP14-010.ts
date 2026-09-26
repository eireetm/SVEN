// BP14-010 Tinkering Shopkeeper — Forestcraft follower, 1, 2/1. 宴楽・人形・超克.
// {[fanfare]} Put a Puppet token into your EX area. Then, if there are at least 3 cards in your EX area, give
// your leader {[defense]}+1. (The Puppet counts — ruling.)
import { defineCard, fanfare } from "../helpers";
import { PUPPET } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([PUPPET]);
        if (fx.game.cards(fx.controller, "ex").length >= 3) yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
