// BP15-019 Wind Fairy — Forestcraft follower, 6, 4/4. 妖精.
// Storm.
// {[fanfare]} Put 2 Fairy Wisp tokens into your EX area.
// {[act]} {[cost01]}, discard this: Select a card on your field. Return it to its owner's hand and put a Fairy
// Wisp token into your EX area. (Valid in the hand — ruling.)
import { discardThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { yourCardOnField } from "../targets";
import { FAIRY_WISP } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY_WISP, FAIRY_WISP]);
      },
    }),
    activated(
      { playPoints: 1, custom: discardThis },
      {
        validIn: ["hand"],
        targets: [yourCardOnField()],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
          yield* fx.tokensToEx([FAIRY_WISP]);
        },
      },
    ),
  ],
});
