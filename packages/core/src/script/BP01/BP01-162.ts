// BP01-162 Path to Purgatory — Neutral amulet, 3.
// {[fanfare]} Draw 3 cards. Deal 3 damage to your leader.
// At the start of your end phase, if your leader's defense is 6 or less, {[engage]}, put this
// card into its owner's cemetery: Deal 6 damage to each enemy follower on the field.
// (An automatic ability with an optional cost, CR 10.4.7.4; the "if" is checked when it
// triggers and when it is played.)
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(3);
        yield* fx.dealDamage(fx.game.leader(fx.controller), 3);
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, c) => g.state.players[c].leaderDefense <= 6,
      cost: {
        canPay: (g, _c, self) => g.card(self)?.zone === "field" && !g.card(self)!.engaged,
        *pay(fx) {
          yield* fx.engage([fx.self]);
          yield* fx.bury([fx.self]);
        },
      },
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 6);
      },
    }),
  ],
});
