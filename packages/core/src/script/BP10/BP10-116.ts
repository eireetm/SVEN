// BP10-116 One-Winged Traitor (Evolved) — Neutral follower, 3/3. 堕天使.
// On Evolve - Select another Fallen Angel or Angel follower on your field and give it {[attack]}
// +1/{[defense]}+1.
import { defineCard, onEvolve } from "../helpers";
import { anotherYourFollower } from "../targets";
import { angelic } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [anotherYourFollower({ filter: angelic })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
