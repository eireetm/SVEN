// CP01-077 Mejiro Palmer — Havencraft follower, 4, 4/4. ウマ娘・メジロ家.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Search your deck for a Mejiro Family follower and add it to your hand.
// {[fanfare]} If there is a Make! Some! NOISE! is in your cemetery, give this follower {[attack]}+1/{[defense]}+1 and Rush.
import { defineCard, fanfare, serveAbility } from "../helpers";
import { isFollower, named } from "../targets";
import { mejiro } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && mejiro(fx.game, id));
      },
    }),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        if (g.card(fx.self)?.zone !== "field" || !g.cards(fx.controller, "cemetery").some((id) => named("Make! Some! NOISE!")(g, id))) return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
  ],
});
