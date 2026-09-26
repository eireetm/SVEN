// BP17-098 Vice, Death Grip — Havencraft follower, 5, 3/3. 機械・狂信.
// Each other Machina follower on your field has Rush.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may reveal up to 2 Machina followers not named
// Vice, Death Grip and add them to your hand. Put the rest on the bottom of your deck in any order. You may summon up to
// 2 Machina followers that cost 2 or less from your hand. (Original cost, 元のコスト.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { isFollower, named } from "../targets";
import { machina } from "./shared";
import { smallMachinaFollower } from "./shared-haven";

const vice = named("Vice, Death Grip");

export default defineCard({
  field: {
    // keywordsFor: typeAndTraits (not info) for the other cards.
    keywordsFor: (g, self, card) => {
      if (card === self) return [];
      const c = g.card(card);
      if (c?.zone !== "field" || c.controller !== g.card(self)!.controller) return [];
      const k = g.typeAndTraits(card);
      return k.type === "follower" && k.traits.includes("機械") ? ["rush"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* lookAtTopCards(fx, 5, { filter: (gg, id) => isFollower(gg, id) && machina(gg, id) && !vice(gg, id), to: "hand", max: 2 });
        const small = g.cards(fx.controller, "hand").filter((id) => smallMachinaFollower(g, id));
        yield* fx.putOntoField(yield* fx.chooseCards(small, 0, Math.min(2, small.length)));
      },
    }),
  ],
});
