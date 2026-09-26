// BP20-114 Dogged One — Neutral follower, 2, 2/2. 光輝.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If you don't have a Super Evolution Point, give this {[attack]}+1/{[defense]}+1 and Storm. (SEP starts at 1 —
// ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { noSuperEvolutionPoint } from "./shared-neutral";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (!noSuperEvolutionPoint(fx.game, fx.controller) || fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
