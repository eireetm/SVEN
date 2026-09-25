// BP07-112 Colorful Cook — Neutral follower, 1, 1/2. 自然・コック.
// {[fanfare]} You may put a Naterran Great Tree token onto your field or into your EX area. Give your
// leader {[defense]}+1. (+1 either way — ruling.)
// {[lastwords]} Discard a Natura card: Draw a card. (CR 10.4.7.4)
import { discardA } from "../costs";
import { defineCard, fanfare, lastWords } from "../helpers";
import { natura, treeOntoFieldOrEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* treeOntoFieldOrEx(fx);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
    lastWords({
      cost: discardA(natura),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
