// BP20-T01 Crest: Krulle, Heir to Unkilling — Forestcraft crest token. 絶傑・継承者・狩人.
// {[act]} {[cost00]}: Select an enemy follower on the field and change its defense to 1. Activate only once per turn.
// (Valid in the EX area, CR 10.3.6.)
import { activated, changeStatsTo, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* changeStatsTo(fx, fx.targets[0]![0]!, { defense: 1 });
        },
      },
    ),
  ],
});
