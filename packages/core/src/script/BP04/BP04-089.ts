// BP04-089 Euryale — Abysscraft follower, 2, 2/2. 魔界・ゴルゴーン.
// {[fanfare]} Put a Serpent token into your EX area.
// While this card is on your field, each Venomfang Medusa and Stheno on your field has Aura.
import { defineCard, fanfare } from "../helpers";

const SISTERS = ["Venomfang Medusa", "Stheno"];

export default defineCard({
  field: {
    // No game.info() here: this is part of computing card information.
    keywordsFor: (g, self, card) => {
      const c = g.card(card);
      const s = g.card(self);
      if (!c || !s || c.zone !== "field" || c.controller !== s.controller) return [];
      return SISTERS.includes(g.db.get(c.def).name) ? ["aura"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Serpent"]);
      },
    }),
  ],
});
