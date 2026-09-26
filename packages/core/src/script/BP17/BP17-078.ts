// BP17-078 Aenea, Creative Amethyst (Evolved) — 2/2.
// On Evolve - Search your deck for a Roly-Poly Mk II, summon it, then shuffle.
// On Super Evolve - Select a Machina card in your cemetery and put it into your EX area. It costs 3 less to play this turn.
// (Super-evolving triggers both, in either order — rulings.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { inYourZone, named } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named("Roly-Poly Mk II")(fx.game, id), { to: "field" });
      },
    }),
    onSuperEvolve({
      targets: [inYourZone("cemetery", { filter: machina })],
      *resolve(fx) {
        for (const id of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
  ],
});
