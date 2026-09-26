// BP20-045 Devastating Soprano — Runecraft spell, 1. 絶傑・アイドル.
// Choose one. (1) Select an Idolatry card on your field. Destroy it and draw a card. (2) Summon a White Psalm, New
// Revelation token. ((1) needs its target — ruling.)
import { defineCard, spell } from "../helpers";
import { yourCardOnField } from "../targets";
import { idolatry, WHITE_PSALM } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "destroy",
          label: "(1) Destroy an Idolatry card of yours, draw a card",
          targets: [yourCardOnField({ filter: idolatry })],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
            yield* fx.draw(1);
          },
        },
        {
          id: "psalm",
          label: "(2) Summon a White Psalm, New Revelation",
          *resolve(fx) {
            yield* fx.summon([WHITE_PSALM]);
          },
        },
      ],
    }),
  ],
});
