// BP07-049 Magiblade Witch (Evolved) — 3/3.
// On Evolve: Choose one of the following. (1) Summon a Magic Sediment token. (2) Earth Rite: Select
// up to 2 enemy followers on the field and deal 4 damage divided between them.
// (Option (2) can be chosen without paying Earth Rite and then does nothing, CR 13.3.3.2 — BP10-050
// ruling on the same wording; at least 1 damage to each selected follower.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "sediment",
          label: "(1) Summon a Magic Sediment",
          *resolve(fx) {
            yield* fx.summon(["Magic Sediment"]);
          },
        },
        {
          id: "damage",
          label: "(2) Earth Rite: 4 damage divided between up to 2 enemy followers",
          earthRite: true,
          targets: [enemyFollower({ count: 2, upTo: true })],
          *resolve(fx) {
            yield* fx.dealDividedDamage(fx.targets[0]!, 4);
          },
        },
      ],
    }),
  ],
});
