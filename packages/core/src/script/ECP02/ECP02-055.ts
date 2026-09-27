// ECP02-055 Natsuki Kimura [Scarlet Love Song] — Abysscraft follower, 3, 3/3. デレマス・パッション.
// {[evolve]} {[cost01]}: Evolve this.
// While there are at least 10 Passion cards in your cemetery, this has Storm. (A passive ability — ruling.)
// {[fanfare]} If there's an iM@S CG follower on your field that costs 5 or more, evolve this. (元のコスト; on the opponent's turn
// too; not this turn's evolution — rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtLeast } from "../targets";
import { followerThat, imas } from "./shared";

export default defineCard({
  field: {
    // typeAndTraits (not info) inside the keyword passive.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const n = g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("パッション")).length;
      return n >= 10 ? ["storm"] : [];
    },
  },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        if (g.card(fx.self)?.zone !== "field") return;
        if (g.followers(fx.controller).some((id) => followerThat(imas)(g, id) && costAtLeast(5)(g, id))) yield* fx.evolve(fx.self);
      },
    }),
  ],
});
