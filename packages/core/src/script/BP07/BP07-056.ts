// BP07-056 Marion, Elegant Dragonewt — Dragoncraft follower, 1, 2/2. ドラゴニュート.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If Overflow is active for you, look at the top 3 cards of your deck. You may put a
// {[dragoncraft]} follower from among them into your EX area. Put the rest on the bottom of your
// deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { and, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* lookAtTopCards(fx, 3, { filter: and(isFollower, isClass("Dragoncraft")), to: "ex" });
      },
    }),
  ],
});
