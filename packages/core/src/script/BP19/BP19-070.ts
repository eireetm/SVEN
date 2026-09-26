// BP19-070 Mermaid Songstress — Dragoncraft follower, 1, 1/2. 海洋・シンガー.
// {[fanfare]} Discard a Marine card: Put the top card of your deck into your EX area. If your EX area has at least 2 cards,
// give your leader {[defense]}+2. (The card just put there counts — ruling; both sentences are the effect after the colon,
// CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { marine } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(marine),
      *resolve(fx) {
        yield* fx.topToEx(1);
        if (fx.game.cards(fx.controller, "ex").length >= 2) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
