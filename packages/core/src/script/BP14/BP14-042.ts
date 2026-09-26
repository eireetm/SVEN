// BP14-042 Story of a Lifetime — Runecraft spell, 3. 宴楽・魔法使い・禁忌.
// Look at the top 4 cards of your deck. From among them, reveal 2 and add them to your hand. Bury the rest.
// If there's a Yukishima, Master Biographer on your field, recover 1 play point. (The 2 cards must be taken
// — ruling.)
import { defineCard, spell } from "../helpers";
import { namedOnYourField, YUKISHIMA } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(4);
        yield* fx.lookAt(top);
        const taken = yield* fx.selectCards(top, Math.min(2, top.length), 2, fx.controller, top);
        yield* fx.reveal(taken);
        yield* fx.returnToHand(taken);
        yield* fx.bury(top.filter((id) => fx.game.card(id)?.zone === "deck"));
        if (namedOnYourField(fx.game, fx.controller, YUKISHIMA)) yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
