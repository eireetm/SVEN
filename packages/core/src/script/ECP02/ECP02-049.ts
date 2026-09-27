// ECP02-049 Mirei Hayasaka [individuals] — Abysscraft follower, 2, 2/3. デレマス・キュート.
// While there are at least 10 iM@S CG cards in your cemetery, this has Storm. (A passive ability, gained and lost as the count
// changes — ruling.)
// {[fanfare]} Bury the top 2 cards of your deck.
// Strike - Select an enemy follower on the field and, if there are at least 10 iM@S CG cards in your cemetery, deal it 2 damage.
import { defineCard, fanfare, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { imas, inYourCemetery } from "./shared";

export default defineCard({
  field: {
    // typeAndTraits (not info) inside the keyword passive.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const n = g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("デレマス")).length;
      return n >= 10 ? ["storm"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (inYourCemetery(fx.game, fx.controller, imas) >= 10) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
