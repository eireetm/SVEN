// BP01-062 Dragonbond Mage — Runecraft follower, 3, 3/4.
// Whenever you play a spell, place 1 spell counter on this card. (Each copy triggers — ruling.)
// {[act]} Remove 3 spell counters from this card: Select an enemy follower on the field and deal
// it 5 damage. (Counters, CR 15.1.)
import { activated, defineCard, whenYouPlay } from "../helpers";
import { enemyFollower, isSpell } from "../targets";

export default defineCard({
  abilities: [
    whenYouPlay(
      {
        *resolve(fx) {
          yield* fx.addCounters(fx.self, "spell", 1);
        },
      },
      isSpell,
    ),
    activated(
      {
        custom: {
          canPay: (g, _c, self) => g.counters(self, "spell") >= 3,
          *pay(fx) {
            yield* fx.removeCounters(fx.self, "spell", 3);
          },
        },
      },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      },
    ),
  ],
});
