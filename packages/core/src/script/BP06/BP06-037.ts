// BP06-037 Mysteria, Magic Founder — Runecraft follower, 3, 2/4. 魔法使い・学院.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Reveal an Academic follower from your hand: Select an enemy follower on the field and
// deal it 2 damage.
// While this card is on your field, any Academic follower you play costs 1 less. (Two: 2 less —
// ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, enemyFollower, hasTrait, isFollower } from "../targets";
import { academicDiscount } from "./shared";

const academicFollower = and(isFollower, hasTrait("学院"));

export default defineCard({
  field: academicDiscount,
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: {
        canPay: (g, c) => g.cards(c, "hand").some((id) => academicFollower(g, id)),
        *pay(fx) {
          const cards = fx.game.cards(fx.controller, "hand").filter((id) => academicFollower(fx.game, id));
          yield* fx.reveal(yield* fx.chooseCards(cards, 1, 1));
        },
      },
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
