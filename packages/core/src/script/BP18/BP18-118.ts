// BP18-118 Saito, Mao Ward Officer (Evolved) — 3/3.
// On Evolve - Choose 1. (1) Select an A-Class Pyromancy in your cemetery and put it into your EX area. It costs 1 less to
// play this turn. (2) Give your leader {[defense]}+1. Bury the top card of your deck. (3) Banish a card from your hand: Draw
// a card. ((1) needs its target — ruling; (3)'s cost is asked as it resolves, CR 10.4.7.5.)
import { banishFromYour } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { inYourZone, named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "pyromancy",
          label: "(1) An A-Class Pyromancy from your cemetery into your EX area, 1 less this turn",
          targets: [inYourZone("cemetery", { filter: named("A-Class Pyromancy") })],
          *resolve(fx) {
            for (const id of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.changePlayCost(id, -1, "endOfTurn");
          },
        },
        {
          id: "leader",
          label: "(2) Leader +1, bury the top card of your deck",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 1);
            yield* fx.mill(1);
          },
        },
        {
          id: "draw",
          label: "(3) Banish a card from your hand: draw a card",
          cost: banishFromYour(["hand"], () => true),
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
