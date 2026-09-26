// BP15-077 Valnareik, Lustful Desire (Evolved) — Abysscraft follower, 3/3. 絶傑・魔界.
// While Sanguine is active for you, this has Storm.
// On Evolve - Choose 1. (1) Put a Wings of Desire token into your EX area. (2) Draw a card.
import { defineCard, onEvolve } from "../helpers";
import { sanguineStorm } from "./shared-abyss";

export default defineCard({
  selfKeywords: sanguineStorm,
  abilities: [
    onEvolve({
      modes: [
        {
          id: "wings",
          label: "(1) A Wings of Desire into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx(["Wings of Desire"]);
          },
        },
        {
          id: "draw",
          label: "(2) Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
