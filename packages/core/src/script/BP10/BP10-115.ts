// BP10-115 One-Winged Traitor — Neutral follower, 2, 2/2. 堕天使.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Look at the top card of your deck. If it's an Angel or Fallen Angel card, you may reveal it
// and add it to your hand.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { angelic } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        // The card that isn't taken stays on top (a deck of one card: "the rest" is none).
        const [top] = fx.topCards(1);
        if (top === undefined) return;
        yield* fx.lookAt([top]);
        const [taken] = yield* fx.selectCards(angelic(fx.game, top) ? [top] : [], 0, 1, fx.controller, [top]);
        if (taken === undefined) return;
        yield* fx.reveal([taken]);
        yield* fx.returnToHand([taken]);
      },
    }),
  ],
});
