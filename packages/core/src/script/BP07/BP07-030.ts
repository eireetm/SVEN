// BP07-030 Lupine Axeman — Swordcraft follower, 2, 2/3. 自然・兵士・獣.
// {[fanfare]} You may put a Naterran Great Tree token onto your field or into your EX area.
// Activate {[engage]} and any number of cards named Naterran Great Tree on your field: Select an
// enemy follower on the field and deal it damage equal to the number of cards named Naterran Great
// Tree engaged this way. (The Trees engaged as the cost — ruling. "Any number" includes 0, CR
// 10.6.2.3.2.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { isTree, treeOntoFieldOrEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({ resolve: treeOntoFieldOrEx }),
    activated(
      {
        engageSelf: true,
        custom: {
          canPay: () => true,
          *pay(fx) {
            const trees = fx.game.cards(fx.controller, "field").filter((id) => fx.game.card(id)?.engaged === false && isTree(fx.game, id));
            const chosen = yield* fx.chooseCards(trees, 0, trees.length);
            yield* fx.engage(chosen);
            fx.memory.engagedTrees = chosen.length;
          },
        },
      },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, Number(fx.memory.engagedTrees ?? 0));
        },
      },
    ),
  ],
});
