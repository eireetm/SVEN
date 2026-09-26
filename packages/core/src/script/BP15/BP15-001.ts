// BP15-001 Izudia, Unkilling Annihilation — Forestcraft follower, 3, 3/4. 絶傑・狩人.
// {[fanfare]} Banish an Izudia, Omen of Unkilling from your cemetery: Select an enemy follower on the field and
// change its defense to 1.
// Activate {[engage]} this: Select an enemy follower on the field and deal it 1 damage. When it's put from the
// field into the cemetery this turn, put an Annihilating Onslaught token into your EX area. (A delayed trigger,
// CR 10.7.5: also after Izudia has left the field; twice for two activations — rulings.)
import { banishFromYour } from "../costs";
import { activated, changeStatsTo, defineCard, delayedWhenPutIntoCemetery, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYour(["cemetery"], named("Izudia, Omen of Unkilling"), 1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* changeStatsTo(fx, fx.targets[0]![0]!, { defense: 1 });
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const card = fx.targets[0]![0]!;
          yield* fx.dealDamage(card, 1);
          yield* fx.delay(2, "endOfTurn", { card });
        },
      },
    ),
    delayedWhenPutIntoCemetery(function* (fx) {
      yield* fx.tokensToEx(["Annihilating Onslaught"]);
    }),
  ],
});
