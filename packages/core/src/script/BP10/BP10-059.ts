// BP10-059 Lævateinn Dragon, Dual Form γ — Dragoncraft advanced follower, 6, 6/6. 竜族・武装.
// While there are at least 5 Armed cards in your cemetery, this follower has Storm. (A passive: it
// gains and loses Storm as the count changes — ruling.)
// {[act]} {[cost01]}, bury a Draconic Weapon: Deal 2 damage to each enemy follower on the field. Give
// this follower {[attack]}+2/{[defense]}+2. (A Draconic Weapon on your field, CR 10.4.3.)
import { buryFromYourField } from "../costs";
import { activated, defineCard } from "../helpers";
import { named } from "../targets";

export default defineCard({
  field: {
    // keywordsFor must not use info(): the cemetery cards' traits come from typeAndTraits.
    keywordsFor: (g, self, card) =>
      card === self && g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("武装")).length >= 5
        ? ["storm"]
        : [],
  },
  abilities: [
    activated(
      { playPoints: 1, custom: buryFromYourField(named("Draconic Weapon")) },
      {
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
        },
      },
    ),
  ],
});
