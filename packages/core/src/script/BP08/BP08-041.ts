// BP08-041 Edict of Truth — Runecraft spell, 5. 絶傑・魔法使い.
// When a Raio, Omen of Truth is put onto your field, banish this card from your cemetery: Gain 1
// Evolution Point. (Also for the player going first, and with 3 EP already — ruling.)
// ----------
// Look at the top 5 cards of your deck. You may put up to 2 cards that cost 3 or less from among them
// into your EX area. They cost 3 less to play this turn. Put the rest on the bottom of your deck in
// any order. (元のコスト.)
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { costAtMost } from "../targets";
import { whenOmenEntersYourField } from "./shared";

export default defineCard({
  abilities: [
    whenOmenEntersYourField("Raio, Omen of Truth", {
      *resolve(fx) {
        yield* fx.gainEvolutionPoints(1);
      },
    }),
    spell({
      *resolve(fx) {
        const cards = yield* lookAtTopCards(fx, 5, { filter: costAtMost(3), to: "ex", max: 2 });
        for (const card of cards) yield* fx.changePlayCost(card, -3, "endOfTurn");
      },
    }),
  ],
});
