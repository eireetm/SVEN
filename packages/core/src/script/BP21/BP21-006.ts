// BP21-006 Cleaver Cat (Evolved) — 3/3.
// On Evolve - Return another Academic or Beast follower from your field to its owner's hand: Select an enemy follower on the
// field and deal it 3 damage. (CR 10.4.7.4; a returned token is removed, 9.1.4.4.)
import { returnAnotherFromYourField } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { academicOrBeastFollower } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: returnAnotherFromYourField(academicOrBeastFollower),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
