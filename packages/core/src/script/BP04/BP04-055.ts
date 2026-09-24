// BP04-055 Magic Owl — Runecraft follower, 1, 1/1. 魔法生物.
// Rush.
// {[fanfare]}/{[lastwords]} Discard a spell: Draw a card. (No discard, no draw — ruling.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { discardA } from "../costs";
import { isSpell } from "../targets";

const discardSpellToDraw = {
  cost: discardA(isSpell),
  *resolve(fx: import("../../engine/effects/context").EffectContext) {
    yield* fx.draw(1);
  },
};

export default defineCard({
  keywords: ["rush"],
  abilities: [fanfare(discardSpellToDraw), lastWords(discardSpellToDraw)],
});
