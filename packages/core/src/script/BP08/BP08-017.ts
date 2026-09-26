// BP08-017 Ward of Unkilling — Forestcraft amulet, 2. 絶傑・狩人.
// {[fanfare]} Select an enemy follower on the field and give it {[attack]}-2.
// {[act]} {[cost01]}, {[engage]}, bury this card: Select a Hunter follower that costs 2 or less in
// your cemetery and summon it. (元のコスト. Targets are selected before the cost is paid, CR
// 10.6.2.3, 10.6.2.5.)
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtMost, enemyFollower, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -2, 0);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        targets: [inYourZone("cemetery", { filter: and(isFollower, hasTrait("狩人"), costAtMost(2)) })],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0]!);
        },
      },
    ),
  ],
});
