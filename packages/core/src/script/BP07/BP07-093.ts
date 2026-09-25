// BP07-093 Bunny-Eared Administrator — Havencraft follower, 2, 2/1. 獣・童話.
// {[fanfare]} If this card wasn't put onto the field from hand, select an enemy follower on the field
// and deal it 3 damage. (CR 5.5.3)
// {[act]} {[cost01]}, discard this card: Give your leader {[defense]}+1. Put this card into your deck
// 3rd from the top. (Valid in the hand, CR 10.3.5. With 1 card or fewer in the deck it goes to the
// bottom — ruling, CR 4.1.3.1.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ when: (g, _c, self) => g.enteredFrom(self) !== "hand" })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 3);
      },
    }),
    activated(
      {
        playPoints: 1,
        custom: {
          canPay: () => true,
          *pay(fx) {
            const [discarded] = yield* fx.discardCards([fx.self]);
            fx.memory.discarded = discarded ?? null;
          },
        },
      },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
          const card = fx.memory.discarded;
          if (typeof card === "string" && fx.game.card(card)?.zone === "cemetery") yield* fx.putIntoDeckAt(card, 3);
        },
      },
    ),
  ],
});
