// BP21-111 Lucius, Travelled Trainer (Evolved) — 3/5.
// On Evolve - Discard an Academic card: Select an enemy follower on the field and deal it 4 damage. (CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { academic } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(academic),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
