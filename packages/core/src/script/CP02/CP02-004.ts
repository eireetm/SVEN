// CP02-004 Yuzu Kitami — Forestcraft follower, 1, 1/1. デレマス・パッション.
// {[evolve]} {[cost02]}: Evolve this follower.
// Ward.
// Activate, Lesson (1): Select another card that costs 1 or less on your field and return it to its owner's hand. For the
// rest of this turn, this card's Activate abilities except Evolve can't be activated. (元のコスト. Each copy has its own
// ability; the restriction stays on the follower after it evolves — rulings.)
import { lesson } from "../costs";
import { activated, defineCard, evolveAbility } from "../helpers";
import { anotherCardCostingAtMost } from "./shared";

const EXCEPT_EVOLVE = true;

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(2),
    activated(
      { custom: lesson(1) },
      {
        targets: [anotherCardCostingAtMost(1)],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
          yield* fx.cantActivate(fx.self, EXCEPT_EVOLVE);
        },
      },
    ),
  ],
});
