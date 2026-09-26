// BP12-050 Chain Lightning — Runecraft spell, 3. 魔法使い.
// At the start of your end phase, if this card is in your EX area, bury it. (Valid in the EX area, CR
// 10.3.5; each copy triggers; playing this automatic ability is not playing a spell — rulings.)
// ----------
// Deal 4 damage to each enemy leader. If there are at least 2 Mage followers on your field, put this card
// into its owner's EX area.
import { atStartOfYourEndPhase, defineCard, spell } from "../helpers";
import { mageFollowersOnField } from "./shared";

export default defineCard({
  abilities: [
    {
      ...atStartOfYourEndPhase({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "ex") yield* fx.bury([fx.self]);
        },
      }),
      validIn: ["ex"],
    },
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 4);
        if (mageFollowersOnField(fx.game, fx.controller) >= 2 && fx.game.card(fx.self)?.zone === "resolution") {
          yield* fx.putIntoEx([fx.self]);
        }
      },
    }),
  ],
});
