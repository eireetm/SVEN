// BP07-068 Feral Aether — Dragoncraft spell, 1. 自然.
// Summon a Naterran Great Tree token. If Overflow is active for you, summon up to 3 instead.
// (Up to 3 includes 0 — ruling.)
import { defineCard, spell } from "../helpers";
import { TREE, upToTrees } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* upToTrees(fx, 3);
        else yield* fx.summon([TREE]);
      },
    }),
  ],
});
