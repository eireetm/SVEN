// CP01-071 Meisho Doto — Havencraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Give this follower {[attack]}+1/{[defense]}+1. Search your deck for an amulet that costs 1 play point and put it onto
// your field. (+1/+1 also when none is found — ruling.)
import { defineCard, onRace, serveAbility } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.search((id) => isAmulet(fx.game, id) && fx.game.info(id).cost === 1, { to: "field" });
      },
    }),
  ],
});
