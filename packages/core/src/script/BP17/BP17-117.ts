// BP17-117 Naterra's Future — Neutral spell, 1. 自然.
// Look at the top card of your deck. If it's a Natura card, you may reveal it and add it to your hand. Put a Naterran Great
// Tree token into your EX area. (A card not taken stays on top, unrevealed — ruling.)
import { defineCard, spell } from "../helpers";
import { natura, TREE } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(1);
        const chosen = yield* fx.selectCards(top.filter((id) => natura(fx.game, id)), 0, 1, fx.controller, top);
        if (chosen.length > 0) {
          yield* fx.reveal(chosen);
          yield* fx.returnToHand(chosen);
        }
        yield* fx.tokensToEx([TREE]);
      },
    }),
  ],
});
