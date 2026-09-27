// CP01-058 Fine Motion — Abysscraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Give this follower {[attack]}+1/{[defense]}+1. Give your leader {[defense]}+2. Put the top 2 cards of your deck into
// your cemetery.
import { defineCard, onRace, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.mill(2);
      },
    }),
  ],
});
