// BP01-057 Dimension Shift — Runecraft spell, 12.
// When playing this card, banish 10 spells in your cemetery: This card costs 7 play points to
// play. // Take another turn after this one.
// (CR 10.4.7.3; "costs 7" is set before other changes, 10.10.2.4 — ruling; this card does not
// count itself.)
import { defineCard, spell } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  playOptions: [
    {
      id: "banish10",
      label: "Banish 10 spells in your cemetery: costs 7",
      canPay: (g, c) => g.spellsInCemetery(c) >= 10,
      setCost: 7,
      *pay(fx) {
        const spells = fx.game.cards(fx.controller, "cemetery").filter((id) => isSpell(fx.game, id));
        yield* fx.banish(yield* fx.chooseCards(spells, 10, 10));
      },
    },
  ],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.extraTurn(); // CR 5.28
      },
    }),
  ],
});
