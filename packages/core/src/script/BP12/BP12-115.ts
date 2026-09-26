// BP12-115 We've Got a Case! — Neutral spell, 2. 探偵.
// Declare any card name. Reveal the top card of your deck. If it has the declared name, draw 2 cards. If
// not, draw 1 card. (Token names too; the revealed card is the one drawn — rulings. CR 5.33.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const name = yield* fx.declareCardName();
        const [top] = fx.topCards(1);
        if (top !== undefined) yield* fx.reveal([top]);
        const hit = top !== undefined && name !== null && fx.game.info(top).names.includes(name);
        yield* fx.draw(hit ? 2 : 1);
      },
    }),
  ],
});
