// BP05-086 Marwynn, Omen of Repose — Havencraft follower, 4, 4/4. 絶傑・狂信.
// {[evolve]} {[cost04]}: Evolve this follower.
// {[evolve]} Skip your next turn: {[evolve]} this follower.
// (CR 5.26.2: after the opponent's next turn, the opponent takes another turn — ruling.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(4),
    evolveAbility({
      custom: {
        canPay: () => true,
        *pay(fx) {
          yield* fx.skipNextTurn();
        },
      },
    }),
  ],
});
