// BP09-054 Zirnitra, Dragon's Flame — Dragoncraft follower, 6, 3/4. ドラゴニュート・竜族.
// When playing this card, bury a follower with "Zirnitra" in its name: This card costs 3 less to play.
// (On your field, CR 10.4.3; once only, not 6 less for two — ruling.)
// ----------
// {[fanfare]} Summon a Dragon token. Draw a card for every Wyrmkin token on your field.
// While this card is on your field, each Wyrmkin token on your field has Storm.
import { buryFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { and, isFollower, isToken, nameIncludes } from "../targets";
import { wyrmkin } from "./shared";

export default defineCard({
  playOptions: [
    {
      id: "zirnitra",
      label: 'Bury a follower with "Zirnitra" in its name: this card costs 3 less',
      ...buryFromYourField(and(isFollower, nameIncludes("Zirnitra"))),
      freesFieldSlots: 1,
      costDelta: -3,
    },
  ],
  field: {
    // Only the card and its type and traits are read (keywordsFor is part of computing information).
    keywordsFor: (g, self, card) => {
      const c = g.card(card);
      return c?.zone === "field" && c.controller === g.card(self)?.controller && g.db.get(c.def).token && g.typeAndTraits(card).traits.includes("竜族")
        ? ["storm"]
        : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Dragon"]);
        const tokens = fx.game.cards(fx.controller, "field").filter((id) => isToken(fx.game, id) && wyrmkin(fx.game, id));
        yield* fx.draw(tokens.length);
      },
    }),
  ],
});
