// BP06-021 Steadfast Samurai — Swordcraft follower, 1, 1/1. 兵士.
// This follower doesn't take combat damage. (Bane still destroys it — ruling; combat damage is
// the damage fighting followers deal each other, CR 5.14.3.2.)
// {[act]} {[cost02]}: Give this follower {[attack]}+1/{[defense]}+1 and Rush.
import { activated, defineCard } from "../helpers";

export default defineCard({
  field: {
    damageTaken: (_g, _self, damage) => (damage.combat ? -damage.amount : 0),
  },
  abilities: [
    activated(
      { playPoints: 2 },
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 1, 1);
          yield* fx.giveKeyword(fx.self, "rush");
        },
      },
    ),
  ],
});
