// BP20-105 Knight of the Holy Order — Havencraft follower, 2, 2/2. 先導.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} If this was summoned by an ability, evolve it. (Put onto the field by one — the Japanese and official English
// texts; on the opponent's turn too — ruling.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field" && enteredByAbility(fx)) yield* fx.evolve(fx.self);
      },
    }),
  ],
});
