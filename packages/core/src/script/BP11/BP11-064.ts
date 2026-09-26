// BP11-064 Mermaid Guide (Evolved) — Dragoncraft follower, 5/5. 海洋.
// While there are at least 5 Marine cards in your cemetery, this follower has Storm.
// On Evolve - Discard a Marine card: Draw 2 cards.
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { marine } from "./shared-dragon";
import { stormWithFiveMarines } from "./shared-mermaid";

export default defineCard({
  selfKeywords: stormWithFiveMarines,
  abilities: [
    onEvolve({
      cost: discardA(marine),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
