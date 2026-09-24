// BP02-045 Multipart Experiment — Runecraft spell, 4.
// Choose up to 2 of the following. Spellchain (10): Choose up to 3 instead.
// (1) Select an enemy follower on the field and deal it 3 damage. (2) Summon a Guardform Golem
// token. (3) Draw a card.
// (CR 5.18.2.1: at least one, each at most once — rulings; Spellchain decides the number when the
// card is played, 5.18.3.1.1.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, c) => (g.spellchain(c, 10) ? 3 : 2),
      modes: [
        {
          id: "1",
          label: "Deal 3 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
        {
          id: "2",
          label: "Summon a Guardform Golem token",
          *resolve(fx) {
            yield* fx.summon(["Guardform Golem"]);
          },
        },
        {
          id: "3",
          label: "Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
