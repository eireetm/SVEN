// BP17-048 Fruits of Wisdom — Runecraft spell, 1. 機械・自然・ゴーレム.
// Look at the top card of your deck. If it's a Machina card, you may put it into your EX area. Put an Assembly Droid token
// into your EX area. (Otherwise it stays on top — ruling.)
import { defineCard, spell } from "../helpers";
import { DROID, machina } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(1);
        const chosen = yield* fx.selectCards(top.filter((id) => machina(fx.game, id)), 0, 1, fx.controller, top);
        if (chosen.length > 0) yield* fx.putIntoEx(chosen);
        yield* fx.tokensToEx([DROID]);
      },
    }),
  ],
});
