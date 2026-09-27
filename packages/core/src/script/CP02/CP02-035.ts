// CP02-035 Mizuki Kawashima — Runecraft follower, 7, 7/7. デレマス・クール.
// Activate {[engage]}: Deal 3 damage to each enemy leader and enemy follower on the field. If there are at least 9 cards with
// different base costs in your cemetery, deal 7 damage instead. (The number of different 元のコスト among them, CR 5.24.1.)
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          const g = fx.game;
          const opp = g.opponent(fx.controller);
          const costs = new Set(g.cards(fx.controller, "cemetery").flatMap((id) => (g.info(id).cost === null ? [] : [g.info(id).cost])));
          yield* fx.dealDamageEach([g.leader(opp), ...g.followers(opp)], costs.size >= 9 ? 7 : 3);
        },
      },
    ),
  ],
});
