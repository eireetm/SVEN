// BP15-PR12 Melodious Monody — Runecraft spell token, 0. 絶傑・アイドル.
// As an additional cost to play this, you may engage any number of Idolatry cards on your field.
// ----------
// Select an enemy follower on the field and deal it damage equal to 2 times the number of Idolatry cards you
// engaged as the additional cost to play this. (Reserved ones, CR 10.4.6; any number includes none, so it is the
// only way to play it; the number is kept for the effect.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { idolatry } from "./shared";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [
    {
      id: "engage",
      label: "Engage any number of Idolatry cards on your field",
      canPay: () => true,
      *pay(fx) {
        const reserved = fx.game.cards(fx.controller, "field").filter((id) => fx.game.card(id)?.engaged === false && idolatry(fx.game, id));
        const chosen = yield* fx.chooseCards(reserved, 0, reserved.length);
        yield* fx.engage(chosen);
        fx.memory.engaged = chosen.length;
      },
    },
  ],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * Number(fx.memory.engaged ?? 0));
      },
    }),
  ],
});
