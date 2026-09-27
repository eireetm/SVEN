// SD01-002 Titania's Sanctuary — Forestcraft amulet, 2. 妖精・プリンセス.
// While this card is on your field, your Pixie tokens have Assail.
// Whenever a Pixie token is put onto your field, give it {[attack]}+1/{[defense]}+1. (Two of these give +2/+2 — ruling.)
// {[fanfare]} Give each Pixie token on your field {[attack]}+1/{[defense]}+1. (Not those in the EX area — ruling.)
import { defineCard, fanfare, whenCardEntersYourField } from "../helpers";
import { and, isFollower } from "../targets";
import { pixieToken } from "../BP11/shared";

const pixieTokenFollower = and(pixieToken, isFollower);

export default defineCard({
  field: {
    keywordsFor(g, self, card) {
      const c = g.card(card);
      if (!c || c.zone !== "field" || g.controller(card) !== g.controller(self) || !g.db.get(c.def).token) return [];
      return g.typeAndTraits(card).traits.includes("妖精") ? ["assail"] : [];
    },
  },
  abilities: [
    whenCardEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data!.card!;
          if (fx.game.card(card)?.zone === "field" && isFollower(fx.game, card)) yield* fx.giveStats(card, 1, 1);
        },
      },
      { filter: pixieToken },
    ),
    fanfare({
      *resolve(fx) {
        for (const id of fx.game.cards(fx.controller, "field")) if (pixieTokenFollower(fx.game, id)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
