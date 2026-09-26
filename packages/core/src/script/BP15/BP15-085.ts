// BP15-085 Adherent of Desire (Evolved) — Abysscraft follower, 2/2. 絶傑・魔界.
// On Evolve - Select a follower on your field with both the Omen and Demon traits and give it Drain.
import { defineCard, onEvolve } from "../helpers";
import { yourFollower } from "../targets";
import { omenDemon } from "./shared-abyss";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [yourFollower({ filter: omenDemon })],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "drain");
      },
    }),
  ],
});
