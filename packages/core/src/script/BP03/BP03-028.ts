// BP03-028 Mach Knight — Swordcraft follower, 3, 3/3. 兵士・ヒーロー.
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} If this card was put onto the field from anywhere other than your hand, give it Storm.
// (CR 5.5.3. A fanfare that grants Storm is not printed Storm — BP03-025 ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.enteredFrom(fx.self) !== "hand") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
