// BP13-035 Meet the Levin Sisters! — Swordcraft spell, 1. 指揮官・兵士・レヴィオン.
// You may play this card for 4 more play points. (CR 10.4.7.3)
// ----------
// Search your deck for a Mina, Levin Vice Leader; Mona, Levin Mage; or Mena, Levin Duelist, reveal it,
// add it to your hand, then shuffle. If you played this card for 4 more play points, search for 1 of each
// instead, summon them, then shuffle. (Each may be left unfound — ruling.)
import { defineCard, spell } from "../helpers";
import { named } from "../targets";

const SISTERS = ["Mina, Levin Vice Leader", "Mona, Levin Mage", "Mena, Levin Duelist"];

export default defineCard({
  playOptions: [{ id: "plus4", label: "Play for 4 more play points", canPay: () => true, *pay() {}, costDelta: 4 }],
  abilities: [
    spell({
      *resolve(fx) {
        if (fx.playOption === "plus4") {
          yield* fx.searchEach(
            SISTERS.map((name) => (id) => named(name)(fx.game, id)),
            { to: "field" },
          );
        } else {
          yield* fx.search((id) => SISTERS.some((name) => named(name)(fx.game, id)));
        }
      },
    }),
  ],
});
