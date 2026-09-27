// CP01-068 Gold Ship — Havencraft follower, 8, 8/8. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Reveal the top card of your deck. Deal X damage to each enemy leader and give your leader {[defense]}+X. X equals the
// revealed card's cost. (The card stays on top — ruling; CR 5.21.)
// {[act]} {[cost10]}: Give this follower {[attack]}+10/{[defense]}+10.
import { activated, defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        const [top] = fx.topCards(1);
        if (top === undefined) return;
        yield* fx.reveal([top]);
        const x = fx.game.info(top).cost ?? 0;
        if (x <= 0) return;
        yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], x);
        yield* fx.giveLeaderDefense(fx.controller, x);
      },
    }),
    activated(
      { playPoints: 10 },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 10, 10);
        },
      },
    ),
  ],
});
