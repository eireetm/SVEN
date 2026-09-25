// BP09-096 Opposing Statues — Havencraft amulet, 4. 偶像・鳥族.
// {[fanfare]} Search your deck for a Holy Fowl of Ivory, summon it, then shuffle your deck.
// {[fanfare]} Bury another amulet: Search your deck for a Hexed Fowl of Ebon, summon it, then shuffle
// your deck. (Another amulet on your field, CR 10.4.3 — an evolved amulet too; the two Fanfares resolve
// in any order — rulings.)
import { buryAnotherFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isAmulet, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named("Holy Fowl of Ivory")(fx.game, id), { to: "field" });
      },
    }),
    fanfare({
      cost: buryAnotherFromYourField(isAmulet),
      *resolve(fx) {
        yield* fx.search((id) => named("Hexed Fowl of Ebon")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
