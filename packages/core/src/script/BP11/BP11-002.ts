// BP11-002 Loxis, Homestead Pioneer (Evolved) — Forestcraft follower, 5/5. 荒野・エルフ族・狩人.
// Once on each of your turns, when a Mount card you control leaves the field, put a Dutiful Steed,
// Bullet Bike, and Arcane Personnel Carrier token into your EX area and give your leader
// {[defense]}+2. (With too little room the player chooses which tokens — ruling. Each Loxis once.)
// Activate Banish 3 amulets from your field: Choose one. (1) Select an enemy follower on the field and
// destroy it. (2) Select another follower on your field and give it {[attack]}+3/{[defense]}+3. (The
// option is chosen before the cost is paid — ruling, CR 10.6.2.2.)
import { banishFromYour } from "../costs";
import { activated, defineCard, whenYourCardLeaves } from "../helpers";
import { anotherYourFollower, enemyFollower, isAmulet } from "../targets";
import { BIKE, CARRIER, leftAsMount, STEED, yourTurn } from "./shared";

export default defineCard({
  abilities: [
    whenYourCardLeaves(
      {
        oncePerTurn: true,
        triggerIf: yourTurn,
        *resolve(fx) {
          yield* fx.tokensToEx([STEED, BIKE, CARRIER]);
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
      { filter: leftAsMount },
    ),
    activated(
      { custom: banishFromYour(["field"], isAmulet, 3) },
      {
        modes: [
          {
            id: "destroy",
            label: "(1) Destroy an enemy follower",
            targets: [enemyFollower()],
            *resolve(fx) {
              yield* fx.destroy(fx.targets[0]!);
            },
          },
          {
            id: "buff",
            label: "(2) Another follower of yours +3/+3",
            targets: [anotherYourFollower()],
            *resolve(fx) {
              yield* fx.giveStats(fx.targets[0]![0]!, 3, 3);
            },
          },
        ],
      },
    ),
  ],
});
