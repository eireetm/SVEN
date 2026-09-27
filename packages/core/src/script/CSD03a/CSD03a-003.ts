// CSD03a-003 Blaster Blade — Swordcraft follower, 3, 3/3. ヴァンガード・ロイヤルパラディン.
// {[evolve]} {[cost01]}: Evolve this follower.
// Single Drive.
// {[fanfare]} If this card was put onto the field by an ability, evolve it. (Also in the opponent's turn; not the turn's evolve
// ability — rulings, CR 8.3.2.1.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["singleDrive"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (enteredByAbility(fx)) yield* fx.evolve(fx.self);
      },
    }),
  ],
});
