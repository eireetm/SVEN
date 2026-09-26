// BP13-076 Kagero, Swordbound Soul — Abysscraft follower, 2, 2/2. 荒野・死者.
// Necrocharge (10) - This follower has Rush and Bane. (A passive — ruling.)
// {[fanfare]} Choose one. (1) Select a Soulstrike in your cemetery and put it into your EX area. NC (20) -
// It costs 2 less to play this turn. (2) Bury the top 2 cards of your deck.
import { defineCard, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";

export default defineCard({
  // CR 13.5.1.2
  selfKeywords: (g, self) => (g.necrocharge(g.controller(self), 10) ? ["rush", "bane"] : []),
  abilities: [
    fanfare({
      modes: [
        {
          id: "soulstrike",
          label: "(1) A Soulstrike from your cemetery into your EX area",
          targets: [inYourZone("cemetery", { filter: named("Soulstrike") })],
          *resolve(fx) {
            // CR 13.5.1.3.2 — the count is fixed when the effect starts resolving.
            const nc = fx.game.necrocharge(fx.controller, 20);
            for (const id of yield* fx.putIntoEx(fx.targets[0]!)) if (nc) yield* fx.changePlayCost(id, -2, "endOfTurn");
          },
        },
        {
          id: "mill",
          label: "(2) Bury the top 2 cards of your deck",
          *resolve(fx) {
            yield* fx.mill(2);
          },
        },
      ],
    }),
  ],
});
