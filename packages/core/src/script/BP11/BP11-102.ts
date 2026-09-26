// BP11-102 Pure Metamorphosis — Havencraft spell, 1. 信仰.
// Select a card on your field. Destroy it and summon a Holy Falcon token.
import { defineCard, spell } from "../helpers";
import { yourCardOnField } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourCardOnField()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.summon(["Holy Falcon"]);
      },
    }),
  ],
});
