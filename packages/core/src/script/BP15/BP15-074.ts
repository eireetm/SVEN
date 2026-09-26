// BP15-074 Orbed Cancer — Dragoncraft follower, 7, 6/7. 海洋.
// {[fanfare]} Draw 3 cards.
// {[act]} {[cost01]}, discard this and a {[dragoncraft]} card that costs 7 or more: Draw 2 cards. (Valid in the
// hand — ruling; 元のコスト.)
import { defineCard, activated, fanfare } from "../helpers";
import { and, costAtLeast, isClass } from "../targets";
import { discardThisAnd } from "./shared-dragon";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(3);
      },
    }),
    activated(
      { playPoints: 1, custom: discardThisAnd(and(isClass("Dragoncraft"), costAtLeast(7))) },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.draw(2);
        },
      },
    ),
  ],
});
