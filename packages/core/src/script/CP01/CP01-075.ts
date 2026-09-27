// CP01-075 Mejiro Dober — Havencraft follower, 2, 2/2. ウマ娘・メジロ家.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Give this follower {[attack]}+1/{[defense]}+1. Give your leader {[defense]}+2.
import { defineCard, onRace, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
