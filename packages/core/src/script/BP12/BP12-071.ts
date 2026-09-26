// BP12-071 Gremory, Death Teller — Abysscraft follower, 2, 2/3. 魔界.
// Ward.
// {[fanfare]} Bury the top 2 cards of your deck.
// {[act]} {[cost01]}: Summon this card from your cemetery. Give it "{[lastwords]} Banish this card."
// Activate only if there are at least 10 cards in your cemetery and no cards named Gremory, Death Teller
// on your field. (Valid in the cemetery; this card itself counts toward the 10 — rulings, CR 10.3.5.)
import { activated, defineCard, fanfare } from "../helpers";
import { onYourField } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
    activated(
      { playPoints: 1 },
      {
        validIn: ["cemetery"],
        condition: (g, c) => g.cards(c, "cemetery").length >= 10 && !onYourField(g, c, "Gremory, Death Teller"),
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "cemetery") return;
          for (const gremory of yield* fx.putOntoField([fx.self])) yield* fx.grant(gremory, "lastWordsBanishSelf");
        },
      },
    ),
  ],
});
