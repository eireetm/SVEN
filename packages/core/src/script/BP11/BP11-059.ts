// BP11-059 Azureflame Dragonewt — Dragoncraft follower, 7, 6/6. ドラゴニュート.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and deal it 6 damage.
// {[act]} {[cost01]}, discard this card and a {[dragoncraft]} card that costs 7 or more: Select an enemy
// follower on the field and deal it 4 damage. (Valid in the hand — ruling, CR 10.3.5.)
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { discardThisAndBigDragon } from "./shared-dragon";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 6);
      },
    }),
    activated(
      { playPoints: 1, custom: discardThisAndBigDragon },
      {
        validIn: ["hand"],
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      },
    ),
  ],
});
