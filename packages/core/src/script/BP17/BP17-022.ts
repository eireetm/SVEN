// BP17-022 Leod, Moonlit Executioner — Swordcraft follower, 1, 1/2. 暗殺者.
// Intimidate.
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage. If this wasn't put onto the field from hand,
// deal 3 damage instead. (From the EX area counts — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["intimidate"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.enteredFrom(fx.self) !== "hand" ? 3 : 1);
      },
    }),
  ],
});
