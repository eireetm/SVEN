// ECP01-036 Pious Flame, Heaven's Scorcher — Dragoncraft spell, 3. ウマ娘.
// When playing this card, discard an Umamusume card: This card costs 2 less to play. (CR 10.4.7.3; with Daiwa Scarlet's
// reduction it costs 3 less — ruling.)
// ----------
// Select an enemy follower on the field. Deal it 5 damage and, if you discarded an Umamusume card that costs 7 or more when
// playing this card, draw a card. (元のコスト. Not playable without an enemy follower to select — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { discardUmamusumeRecorded, discardedCostAtLeast, umamusume } from "./shared";

export default defineCard({
  playOptions: [
    {
      id: "discard",
      label: "Discard an Umamusume card: this costs 2 less",
      costDelta: -2,
      canPay: (g, c, self) => g.cards(c, "hand").some((id) => id !== self && umamusume(g, id)),
      *pay(fx) {
        yield* discardUmamusumeRecorded.pay(fx);
      },
    },
  ],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        if (discardedCostAtLeast(fx, 7)) yield* fx.draw(1);
      },
    }),
  ],
});
