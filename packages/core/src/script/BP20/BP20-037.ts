// BP20-037 Lishenna, Melody Manifest — Runecraft follower, 2, 1/1. 絶傑・アイドル.
// {[fanfare]} Choose one. (1) Select another Idolatry card on your field. Destroy it and put a Melodious Monody token into
// your EX area. (2) Summon a White Psalm, New Revelation token. ((1) needs its target — ruling.)
import { defineCard, fanfare } from "../helpers";
import { MELODIOUS_MONODY, WHITE_PSALM } from "./shared";
import { anotherIdolatryOnYourField } from "./shared-rune";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "destroy",
          label: "(1) Destroy another Idolatry card of yours, a Melodious Monody into your EX area",
          targets: [anotherIdolatryOnYourField],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
            yield* fx.tokensToEx([MELODIOUS_MONODY]);
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
