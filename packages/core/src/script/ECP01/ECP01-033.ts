// ECP01-033 Tsurumaru Tsuyoshi — Dragoncraft follower, 1, 2/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Select an enemy follower on the field and deal it damage equal to the number of faceup cards named Carrot in your
// evolve deck. (Not the Carrots linked to racing followers — ruling.)
import { defineCard, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { faceUpCarrots } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, faceUpCarrots(fx.game, fx.controller).length);
      },
    }),
  ],
});
