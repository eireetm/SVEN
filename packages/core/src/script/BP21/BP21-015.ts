// BP21-015 Vanguard Tigress — Forestcraft follower, 4, 4/3. 獣.
// Storm.
// Strike - Banish 3 Beast cards from your cemetery: Select an enemy follower on the field and deal it 4 damage. (CR 10.4.7.4.)
import { banishFromYour } from "../costs";
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { beast } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      cost: banishFromYour(["cemetery"], beast, 3),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
