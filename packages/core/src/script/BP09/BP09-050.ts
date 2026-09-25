// BP09-050 Tico, Mysterian Spellnerd — Runecraft follower, 2, 2/3. 魔法使い・学院.
// Ward.
// {[lastwords]} Look at the top card of your deck. If it's an Academic card, you may reveal it and add
// it to your hand. (Otherwise it stays on top.)
import { defineCard, lastWords } from "../helpers";
import { academic } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        const top = fx.topCards(1);
        if (top.length === 0) return;
        yield* fx.lookAt(top);
        const chosen = yield* fx.selectCards(top.filter((id) => academic(fx.game, id)), 0, 1, fx.controller, top);
        if (chosen.length === 0) return;
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
      },
    }),
  ],
});
