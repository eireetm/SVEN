// BP15-056 Twinblade Mage — Runecraft follower, 8, 2/2. 魔法使い.
// This costs 6 less to play if there are at least 6 cards in your cemetery with different base costs.
// (元のコストの種類数.)
// ----------
// Storm.
// {[fanfare]} Select up to 2 enemy followers on the field and deal them 3 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playCost: (g, _self, p) => {
    const costs = new Set(g.cards(p, "cemetery").flatMap((id) => (g.info(id).cost === null ? [] : [g.info(id).cost])));
    return costs.size >= 6 ? -6 : 0;
  },
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.targets[0] ?? [], 3);
      },
    }),
  ],
});
