// BP21-023 Agile Twinblader — Swordcraft follower, 1, 2/2. 兵士・学院.
// {[evolve]} {[cost01]}: Evolve this. Activate only if this was put onto the field by an ability.
// {[fanfare]} If this was put onto the field by an ability, give it Storm. (On the opponent's turn too — ruling.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1, { condition: (g, _c, self) => g.enteredByAbility(self) }),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field" && enteredByAbility(fx)) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
