// BP01-150 Death Sentence — Havencraft amulet, 3.
// This card is put onto the field engaged. (Never reserved on the way — ruling.)
// {[act]}{[engage]}, put this card into its owner's cemetery: Select an enemy follower on the field
// and destroy it. (Needs this card reserved — ruling, CR 10.4.6.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  entersEngaged: true,
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});
