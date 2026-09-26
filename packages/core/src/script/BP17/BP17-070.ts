// BP17-070 Mánagarmr Scout — Dragoncraft follower, 3, 3/4. 自然・獣.
// {[fanfare]} Summon a Naterran Great Tree token.
// {[act]} {[cost01]}, banish a Naterran Great Tree from your field: Select an enemy follower on the field and deal it 2
// damage. Activate only twice per turn.
import { banishFromYour } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { isTree, TREE } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([TREE]);
      },
    }),
    activated(
      { playPoints: 1, custom: banishFromYour(["field"], isTree) },
      {
        timesPerTurn: 2,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
  ],
});
