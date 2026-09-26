// BP11-043 Artistic Arcanist (Evolved) — Runecraft follower, 3/6. 魔法使い.
// Bane. Drain.
// On Evolve - Select an enemy follower on the field and put it into its owner's EX area. (A full EX
// area leaves it on the field; a token or advanced card stays in the EX area; it loses its damage and
// effects — rulings.)
// Activate, Earth Rite: Select another follower on your field and give it Rush, Bane, or Drain.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { arcanistRite } from "./shared-rune";

export default defineCard({
  keywords: ["bane", "drain"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
    arcanistRite(),
  ],
});
