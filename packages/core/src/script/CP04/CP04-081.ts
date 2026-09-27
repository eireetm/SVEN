// CP04-081 Yori — Abysscraft follower, 2, 2/2. プリコネ・ディアボロス.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an enemy follower on the field and, if this wasn't put onto the field from hand, deal it 2 damage. (From the EX
// area, deck or cemetery — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.enteredFrom(fx.self) !== "hand") yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
