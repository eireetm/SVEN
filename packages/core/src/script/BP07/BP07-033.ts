// BP07-033 Tempered Aether — Swordcraft spell, 1. 自然.
// Put a Naterran Great Tree token onto your field and into your EX area. (A full zone gets none —
// ruling.)
import { defineCard, spell } from "../helpers";
import { TREE } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon([TREE]);
        yield* fx.tokensToEx([TREE]);
      },
    }),
  ],
});
