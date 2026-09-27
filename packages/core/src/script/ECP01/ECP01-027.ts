// ECP01-027 Lucky Star in the Sky — Runecraft spell, 1. ウマ娘.
// {[quick]}
// Look at the top card of your deck. If it's an Umamusume card, you may reveal it and add it to your hand. If there are at least 5
// Umamusume spells in your cemetery, give your leader {[defense]}+2. (Not taken, it stays on top, unrevealed — ruling. This
// spell is not in the cemetery while it resolves.)
import { defineCard, spell } from "../helpers";
import { mayTakeTopCard, umamusume, umamusumeSpellsInCemetery } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, umamusume);
        if (umamusumeSpellsInCemetery(fx.game, fx.controller) >= 5) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
