// BP17-067 Shark Warrior — Dragoncraft follower, 2, 2/2. 海洋.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an enemy follower on the field and, if this was played from the EX area, deal it 2 damage. (Played,
// CR 5.5.3.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.enteredFrom(fx.self) === "ex" && !enteredByAbility(fx)) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
