// BP07-028 Princess's Strike — Swordcraft spell, 1. 自然・指揮官・プリンセス.
// {[quick]}
// Select an enemy follower on the field and deal it 2 damage. If there's a Mistolina, Forest
// Princess on your field, deal 6 damage instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, onYourField(fx.game, fx.controller, "Mistolina, Forest Princess") ? 6 : 2);
      },
    }),
  ],
});
