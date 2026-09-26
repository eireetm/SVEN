// BP15-083 A Hellish Banquet — Abysscraft spell, 0. 挑戦者・妖怪.
// As an additional cost to play this, bury 2 cards named One-Tailed Fox.
// Activate Banish this from your cemetery: Give each One-Tailed Fox on your field Storm. (Valid in the cemetery —
// ruling.)
// ----------
// Select an enemy follower on the field. Destroy it and draw a card. (Not playable without a target — ruling.)
import { banishThisFromCemetery, buryFromYourField } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";
import { ONE_TAILED_FOX } from "./shared-abyss";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "bury2", label: "Bury 2 One-Tailed Foxes on your field", ...buryFromYourField(named(ONE_TAILED_FOX), 2) }],
  abilities: [
    activated(
      { custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        *resolve(fx) {
          for (const id of fx.game.followers(fx.controller)) if (named(ONE_TAILED_FOX)(fx.game, id)) yield* fx.giveKeyword(id, "storm");
        },
      },
    ),
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
  ],
});
