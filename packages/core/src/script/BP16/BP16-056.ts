// BP16-056 Forte, Blackwing Dragoon — Dragoncraft follower, 5, 6/5. 竜使い.
// Storm. Intimidate.
// {[fanfare]} If you have 10 max play points, give this {[attack]}+1 and Aura.
import { defineCard, fanfare } from "../helpers";
import { tenMaxPlayPoints } from "./shared-dragon";

export default defineCard({
  keywords: ["storm", "intimidate"],
  abilities: [
    fanfare({
      condition: tenMaxPlayPoints,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.giveKeyword(fx.self, "aura");
      },
    }),
  ],
});
