// BP07-077 Nicola, Forbidden Strength (Evolved) — 4/4.
// On Evolve - Select a Machina card that costs 2 or less in your cemetery and put it into your EX
// area. It costs 2 less to play this turn. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(machina, costAtMost(2)) })],
      *resolve(fx) {
        for (const id of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
  ],
});
