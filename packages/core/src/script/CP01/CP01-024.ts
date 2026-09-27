// CP01-024 Symboli Rudolf — Swordcraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[lastwords]} Search your deck for a Tokai Teio, reveal it, and add it to your hand.
import { defineCard, lastWords, serveAbility } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    lastWords({
      *resolve(fx) {
        yield* fx.search((id) => named("Tokai Teio")(fx.game, id));
      },
    }),
  ],
});
