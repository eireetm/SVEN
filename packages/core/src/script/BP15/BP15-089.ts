// BP15-089 Adherent of Screams (Evolved) — Abysscraft follower, 3/3. 絶傑・死霊術師.
// On Evolve - Choose 1. (1) Select a follower in your cemetery with "Rulenye" in its name and summon it. (2) Select
// an enemy follower on the field and deal it 2 damage. (Each option needs its target — rulings.)
// {[lastwords]} Bury the top card of your deck.
import { defineCard, lastWords, onEvolve } from "../helpers";
import { and, enemyFollower, inYourZone, isFollower, nameIncludes } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "rulenye",
          label: "(1) A Rulenye follower from your cemetery onto the field",
          targets: [inYourZone("cemetery", { filter: and(isFollower, nameIncludes("Rulenye")) })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
        {
          id: "damage",
          label: "(2) 2 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
      ],
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
