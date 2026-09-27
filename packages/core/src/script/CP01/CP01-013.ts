// CP01-013 Haru Urara — Forestcraft follower, 2, 2/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Give this follower {[attack]}+1/{[defense]}+1. For the rest of this turn, this follower doesn't take damage.
import { defineCard, onRace, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.preventDamage(fx.self, "all", "endOfTurn");
      },
    }),
  ],
});
