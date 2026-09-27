// CP02-015 Kana Imai (Evolved) — 3/3.
// On Evolve - Look at the top card of your deck. You may reveal it and add it to your hand. If you revealed a Cute card, give
// your leader {[defense]}+2. (Not taken, it stays on top unrevealed, and the leader gets nothing — rulings.)
import { defineCard, onEvolve } from "../helpers";
import { cute, mayTakeTopCard } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const taken = yield* mayTakeTopCard(fx);
        if (taken !== null && cute(fx.game, taken)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
