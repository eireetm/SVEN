// BP21-027 Tony, Plucky Polliwog — Swordcraft follower, 1, 1/2. 兵士・学院.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]} If this was put onto the field by an ability, evolve it. (On the opponent's turn too — ruling.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field" && enteredByAbility(fx)) yield* fx.evolve(fx.self);
      },
    }),
  ],
});
