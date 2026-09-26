// BP08-068 Sneer of Disdain — Dragoncraft spell, 1. 絶傑・竜族.
// When a Galmieux, Omen of Disdain is put onto your field, banish this card from your cemetery: Select
// a follower on your field and deal it 1 damage. (Valid only in the cemetery — ruling.)
// ----------
// Select a follower on the field and deal it 1 damage.
import { defineCard, spell } from "../helpers";
import { anyFollower, yourFollower } from "../targets";
import { whenOmenEntersYourField } from "./shared";

export default defineCard({
  abilities: [
    whenOmenEntersYourField("Galmieux, Omen of Disdain", {
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
    spell({
      targets: [anyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
