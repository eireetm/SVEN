// BP07-012 Cheshire Cat — Forestcraft follower, 1, 1/2. 獣・童話.
// {[fanfare]} Select an enemy leader or enemy follower on the field and deal it 1 damage. If this
// card wasn't put onto the field from hand, deal 2 damage instead. (EX area, deck, cemetery ...
// count — ruling; CR 5.5.3.)
// Activate {[engage]}, put this card on the bottom of it's owner's deck: Select a Fable follower on
// your field or in your EX area and place 2 Fable counters on it.
// The target is selected before the cost is paid (CR 10.6.2.3, 10.6.2.5): it may be this card,
// which then gets no counters (ruling).
import { activated, defineCard, fanfare } from "../helpers";
import { and, enemyLeaderOrFollower, isFollower, yourFieldOrEx } from "../targets";
import { fable } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.enteredFrom(fx.self) !== "hand" ? 2 : 1);
      },
    }),
    activated(
      {
        engageSelf: true,
        custom: {
          canPay: () => true,
          *pay(fx) {
            yield* fx.putOnDeck([fx.self], "bottom");
          },
        },
      },
      {
        targets: [yourFieldOrEx({ filter: and(isFollower, fable) })],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          if (fx.game.card(target)) yield* fx.addCounters(target, "fable", 2);
        },
      },
    ),
  ],
});
