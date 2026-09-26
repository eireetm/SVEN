// BP10-105 Azurite Maiden — Havencraft follower, 2, 2/3. 信仰.
// Ward.
// {[fanfare]} {[cost01]} Select a Faith follower in your cemetery. Put it into your EX area and give it
// {[attack]}+1. (It keeps the +1 when it is played or put onto the field from there — ruling, CR
// 4.8.3.3.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { and, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(1),
      targets: [inYourZone("cemetery", { filter: and(isFollower, hasTrait("信仰")) })],
      *resolve(fx) {
        for (const card of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.giveStats(card, 1, 0);
      },
    }),
  ],
});
