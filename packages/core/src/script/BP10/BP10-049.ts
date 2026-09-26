// BP10-049 Piquant Potioneer (Evolved) — Runecraft follower, 5/5. 魔法使い・錬金術師.
// (Printed "Potion Wizard (Evolved)", corrected in data/fixes.ts.)
// On Evolve - Choose one. (1) Discard a {[runecraft]} card: Give your leader {[defense]}+5. (2) Discard a
// non-{[runecraft]} card: Select an enemy follower on the field and deal it 5 damage. (Either can be
// chosen without the card to discard and then does nothing; (2) needs a target — rulings, CR
// 10.4.7.5, 5.18.3.1.2.)
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, isClass } from "../targets";

const runecraft = isClass("Runecraft");

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "defense",
          label: "(1) Discard a Runecraft card: leader +5 defense",
          cost: discardA(runecraft),
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 5);
          },
        },
        {
          id: "damage",
          label: "(2) Discard a non-Runecraft card: 5 damage to an enemy follower",
          cost: discardA((g, id) => !runecraft(g, id)),
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          },
        },
      ],
    }),
  ],
});
