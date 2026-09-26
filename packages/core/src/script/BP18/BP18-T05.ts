// BP18-T05 Youthful Strike — Dragoncraft spell token, 2. 透京・ドラゴニュート・武闘竜人.
// Select an enemy follower on the field and a Togh Keyoh follower on your field. Destroy the first follower and give the
// second Storm. (Playable only if both can be selected — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { toghKeyoh } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower(), yourFollower({ filter: toghKeyoh })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        const mine = fx.targets[1]![0]!;
        if (fx.game.card(mine)?.zone === "field") yield* fx.giveKeyword(mine, "storm");
      },
    }),
  ],
});
