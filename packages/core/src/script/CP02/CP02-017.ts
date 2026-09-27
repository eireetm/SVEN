// CP02-017 A Single Vessel — Forestcraft amulet, 2. デレマス・クール.
// {[fanfare]}/{[lastwords]} Select an enemy follower on the field and deal it 3 damage. (An amulet's Last Words triggers when
// it is put into the cemetery from the field — ruling.)
// {[act]} {[cost02]}, {[engage]}, discard a card: Bury this card.
import { discardCardsCost } from "../costs";
import { activated, defineCard, fanfare, lastWords, type TimingSpec } from "../helpers";
import { enemyFollower } from "../targets";

const damage3: TimingSpec = {
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, 3);
  },
};

export default defineCard({
  abilities: [
    fanfare(damage3),
    lastWords(damage3),
    activated(
      { playPoints: 2, engageSelf: true, custom: discardCardsCost(1) },
      {
        *resolve(fx) {
          yield* fx.bury([fx.self]);
        },
      },
    ),
  ],
});
