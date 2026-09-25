// BP09-066 Drakewing Assassin — Dragoncraft follower, 3, 3/3. ドラゴニュート・キラー.
// {[fanfare]} Select an enemy follower on the field and deal it damage equal to the number of
// {[dragoncraft]} spells in your cemetery.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, dragonSpell } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, countIn(fx.game, fx.controller, "cemetery", dragonSpell));
      },
    }),
  ],
});
