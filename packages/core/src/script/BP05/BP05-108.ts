// BP05-108 Lyrial, Archer Throne — Neutral follower, 3, 2/5. 天使.
// {[q]}Activate {[engage]}: Deal 2 damage to each enemy leader.
// While this card is on your field, your leader doesn't take ability damage.
// Rulings: ability damage is anything but attack and combat damage; "-2 defense" and "change
// defense to 10" are not damage; prevented damage doesn't count as losing defense; it works while
// Lyrial is still on the field, even at 0 defense before rules handling (CR 11.3).
import { activated, defineCard } from "../helpers";

export default defineCard({
  field: {
    damageToLeader: (g, self, damage) =>
      damage.kind === "ability" && damage.target === g.leader(g.controller(self)) ? -damage.amount : 0,
  },
  abilities: [
    activated(
      { engageSelf: true },
      {
        quick: true,
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        },
      },
    ),
  ],
});
