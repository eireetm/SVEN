// BP12-065 Rockback Ankylosaurus — Dragoncraft follower, 2, 2/3. 自然・竜族.
// {[fanfare]} Summon a Naterran Great Tree token.
// {[fanfare]} {[cost01]}, discard a card: Select an enemy follower on the field and deal it 3 damage.
// (The two Fanfares resolve in any order — ruling.)
import { defineCard, fanfare } from "../helpers";
import { allCosts, discardCardsCost, playPointsCost } from "../costs";
import { enemyFollower } from "../targets";
import { TREE } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([TREE]);
      },
    }),
    fanfare({
      cost: allCosts(playPointsCost(1), discardCardsCost(1)),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
