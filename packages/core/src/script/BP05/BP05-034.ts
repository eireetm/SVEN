// BP05-034 Avaritia — Swordcraft spell, 1. 絶傑・盗賊.
// Look at the top 4 cards of your deck. You may reveal a Thief card from among them and add it to
// your hand. Put the remaining cards on the bottom of your deck in any order. If you revealed an
// Octrice, Omen of Usurpation, return this card to your hand. (The revealed Thief card is that
// Octrice — ruling.)
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { hasTrait, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const moved = yield* lookAtTopCards(fx, 4, { filter: hasTrait("盗賊"), to: "hand" });
        if (moved.some((id) => named("Octrice, Omen of Usurpation")(fx.game, id))) yield* fx.returnToHand([fx.self]);
      },
    }),
  ],
});
