// BP07-024 King's Might — Swordcraft spell, 3. 自然・指揮官・獣.
// When playing this card, engage 2 cards named Naterran Great Tree on your field: This card costs 2
// less to play. (CR 10.4.7.3)
// This card costs 1 less to play if there's a Bayleon, Sovereign Light on your field.
// (Both together: 3 less — ruling.)
// Select an enemy follower on the field and deal it 4 damage.
import { engageYourCards } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { isTree, onYourField } from "./shared";

export default defineCard({
  playOptions: [
    {
      id: "engage2",
      label: "Engage 2 Naterran Great Trees on your field: costs 2 less",
      ...engageYourCards(isTree, 2),
      costDelta: -2,
    },
  ],
  playCost: (g, _self, controller) => (onYourField(g, controller, "Bayleon, Sovereign Light") ? -1 : 0),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
