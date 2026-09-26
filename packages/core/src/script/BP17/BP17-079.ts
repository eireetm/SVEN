// BP17-079 Nicola, Enduring Steward — Abysscraft follower, 2, 1/2. 機械・死者.
// While there's another Machina follower on your field, this has Rush and Bane. (A passive ability — ruling.)
// {[fanfare]} If this wasn't put onto the field from hand, give it Assail. (From the EX area, deck or cemetery — rulings.)
// {[lastwords]} Discard 2 Machina cards: Put this into its owner's EX area and give it "This costs 1 less to play." (With a
// full EX area the cost can still be paid, and the card stays in the cemetery — ruling; CR 10.4.7.4.)
import { discardMatching } from "../costs";
import { defineCard, fanfare, lastWords } from "../helpers";
import { machina } from "./shared";

export default defineCard({
  field: {
    // keywordsFor: typeAndTraits (not info) for the other cards.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const other = g.cards(g.card(self)!.controller, "field").some((id) => {
        if (id === self) return false;
        const k = g.typeAndTraits(id);
        return k.type === "follower" && k.traits.includes("機械");
      });
      return other ? ["rush", "bane"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field" && fx.game.enteredFrom(fx.self) !== "hand") yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
    lastWords({
      cost: discardMatching(machina, 2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "cemetery") return;
        for (const id of yield* fx.putIntoEx([fx.self])) yield* fx.changePlayCost(id, -1);
      },
    }),
  ],
});
