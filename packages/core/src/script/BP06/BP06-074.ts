// BP06-074 Ginsetsu, Great Fox (Evolved) — Abysscraft follower, 1/9. 挑戦者・妖怪.
// While this card is on your field, any Yokai follower you play costs 2 less. Also, if a Yokai
// follower on your field would deal damage, it deals that much plus 1 instead.
// Whenever a Yokai follower you control leaves the field, give this follower {[attack]}+1.
// Rulings: two of them give -4 and +2; tokens count; attack, combat and ability damage all get +1;
// 0 damage stays no damage; with other damage changes the damaged card's player picks the order
// (CR 10.10.2); four foxes leaving together give +4.
import { defineCard, whenYourFollowerLeaves } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

const yokai = and(isFollower, hasTrait("妖怪"));

export default defineCard({
  field: {
    playCostOf: (g, self, card, player) => (player === g.controller(self) && yokai(g, card) ? -2 : 0),
    damageBy: (g, self, damage) =>
      damage.source !== null &&
      g.card(damage.source)?.zone === "field" &&
      g.controller(damage.source) === g.controller(self) &&
      yokai(g, damage.source)
        ? 1
        : 0,
  },
  abilities: [
    whenYourFollowerLeaves(
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 1, 0);
        },
      },
      { includeSelf: true, filter: (m, g) => g.db.get(m.before!.abilityDef).traits.includes("妖怪") },
    ),
  ],
});
