// BP19-075 Garodeth, Insurgent Convict — Abysscraft follower, 3, 3/3. 八獄・魔界.
// {[evolve]} {[cost05]}: Evolve this.
// Whenever your leader's defense decreases during your turn, if it's at least the 4th time this turn, evolve this. (Only on
// your turn; not this turn's evolve ability — rulings, CR 8.3.2.1; counted as it resolves.)
// {[fanfare]} Deal 1 damage to your leader.
import { defineCard, evolveAbility, fanfare, whenYourLeaderLosesDefense } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(5),
    whenYourLeaderLosesDefense(
      {
        *resolve(fx) {
          if (fx.game.leaderDefenseLostThisTurn(fx.controller) >= 4 && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
        },
      },
      { onlyYourTurn: true },
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
      },
    }),
  ],
});
