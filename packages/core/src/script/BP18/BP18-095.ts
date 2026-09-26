// BP18-095 Bloodthirsty Hamster — Abysscraft follower, 2, 0/3. 吸血鬼・獣.
// {[fanfare]} {[cost03]} Select an enemy follower on the field and destroy it. (CR 10.4.7.4.)
// Whenever a follower is put from the field into the cemetery, give this {[attack]}+1. (Destroyed counts; on the opponent's
// turn too — rulings.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare, whenFollowerToCemetery } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(3),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    whenFollowerToCemetery({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
      },
    }),
  ],
});
