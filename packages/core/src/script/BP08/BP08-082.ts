// BP08-082 Marian the Mummy (Evolved) — Abysscraft follower, 4/4. 死者.
// Ward. Necrocharge (7): Assail. Necrocharge (15): Storm and Bane. These are continuous abilities:
// both apply at 15 and disappear when the cemetery count falls below their thresholds (rulings,
// CR 10.9.1.2, 13.5.1).
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  field: {
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const controller = g.card(self)!.controller;
      return [
        ...(g.necrocharge(controller, 7) ? (["assail"] as const) : []),
        ...(g.necrocharge(controller, 15) ? (["storm", "bane"] as const) : []),
      ];
    },
  },
});
