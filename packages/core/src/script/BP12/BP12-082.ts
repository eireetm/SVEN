// BP12-082 Roly-Poly Mk I — Abysscraft follower, 1, 1/3. 機械・魔界.
// Ward.
// While there's an Aenea, Amethyst Rebel on your field, if this follower would take more than 1 damage,
// it takes 1 instead. (Each instance; it follows Aenea — rulings.)
// {[act]} {[cost01]}: Summon this card from your cemetery. Give it {[attack]}+1 and "{[lastwords]} Banish
// this follower." Activate only if there's an Aenea, Amethyst Rebel on your field. (Valid in the
// cemetery — ruling, CR 10.3.5.)
import { activated, defineCard } from "../helpers";
import { onYourField } from "./shared";

const AENEA = "Aenea, Amethyst Rebel";

export default defineCard({
  keywords: ["ward"],
  field: {
    damageTaken: (g, self, damage) => (damage.amount > 1 && onYourField(g, g.controller(self), AENEA) ? 1 - damage.amount : 0),
  },
  abilities: [
    activated(
      { playPoints: 1 },
      {
        validIn: ["cemetery"],
        condition: (g, c) => onYourField(g, c, AENEA),
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "cemetery") return;
          for (const card of yield* fx.putOntoField([fx.self])) {
            yield* fx.giveStats(card, 1, 0);
            yield* fx.grant(card, "lastWordsBanishSelf");
          }
        },
      },
    ),
  ],
});
