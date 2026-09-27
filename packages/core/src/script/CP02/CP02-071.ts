// CP02-071 Sachiko Koshimizu — Abysscraft follower, 2, 3/3. デレマス・キュート.
// {[fanfare]} Deal 2 damage to your leader.
// While your leader's defense is 10 or less, this follower has Storm and Bane. (A passive ability: it gains and loses them as
// the defense changes — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && g.state.players[g.controller(self)].leaderDefense <= 10 ? ["storm", "bane"] : []),
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
      },
    }),
  ],
});
