// BP05-069 Valnareik, Omen of Lust — Abysscraft follower, 2, 2/2. 絶傑・魔界.
// While Sanguine is active for you, this follower has Storm.
// Strike: Deal X damage to each enemy leader. X equals the number of times your leader has lost
// defense this turn. If your leader's defense is 7, give this follower {[attack]}+2/{[defense]}+2.
// Rulings: X counts damage and "-X defense" costs, each time; the +2/+2 part also works with X = 0.
import { defineCard, strike } from "../helpers";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && g.sanguine(g.controller(self)) ? ["storm"] : []),
  },
  abilities: [
    strike({
      *resolve(fx) {
        const x = fx.game.leaderDefenseLostThisTurn(fx.controller);
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), x);
        if (fx.game.info(fx.game.leader(fx.controller)).defense === 7) yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
