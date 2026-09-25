// BP07-003 Cynthia, the Queen's Blade — Forestcraft follower, 6, 4/6. エルフ族.
// {[fanfare]} Put a Fairy Wisp token into your EX area. Give {[attack]}+2 to each Pixie token
// follower on your field. (Also when the EX area is full — ruling.)
// While this card is on your field, each Pixie token on your field has Storm and Assail.
// Whenever a Pixie token is put onto your field, give it {[attack]}+2.
// Pixie token: a token with the Pixie trait (妖精・トークン). A follower that loses Storm during
// its attack still attacks (ruling; the attack is only checked when declared, CR 8.4.3).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare, whenCardEntersYourField } from "../helpers";
import { hasTrait, isToken } from "../targets";

const pixieToken = (g: GameReader, id: CardId): boolean => isToken(g, id) && hasTrait("妖精")(g, id);

export default defineCard({
  field: {
    // keywordsFor: only game.card / db / typeAndTraits.
    keywordsFor: (g, self, card) => {
      const c = g.card(card);
      if (c?.zone !== "field" || c.controller !== g.card(self)?.controller || !g.db.get(c.def).token) return [];
      return g.typeAndTraits(card).traits.includes("妖精") ? ["storm", "assail"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp"]);
        for (const id of fx.game.followers(fx.controller)) if (pixieToken(fx.game, id)) yield* fx.giveStats(id, 2, 0);
      },
    }),
    whenCardEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data?.card;
          if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveStats(card, 2, 0);
        },
      },
      { filter: pixieToken },
    ),
  ],
});
