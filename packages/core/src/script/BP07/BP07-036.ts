// BP07-036 Tetra, Sapphire Rebel (Evolved) — 4/4.
// While this card is on your field, any Machina card you play from the EX area costs 1 less.
// (Two of them: 2 less — ruling.)
// 4 times per turn, when you play a Machina card, select an enemy follower on the field and deal it
// 1 damage. (CR 10.7.2.2; each Tetra 4 times, in either player's turn — rulings.)
import { defineCard, whenYouPlay } from "../helpers";
import { enemyFollower } from "../targets";
import { machina } from "./shared";

export default defineCard({
  field: {
    playCostOf: (g, self, card, player) => (player === g.controller(self) && g.playZone(card) === "ex" && machina(g, card) ? -1 : 0),
  },
  abilities: [
    whenYouPlay(
      {
        timesPerTurn: 4,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      machina,
    ),
  ],
});
