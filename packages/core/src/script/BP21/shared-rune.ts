// Shared pieces of BP21 Runecraft card scripts (not a card: the file name has no set prefix).
import { discardA } from "../costs";
import { activated, fanfare } from "../helpers";
import { academic } from "./shared";

/** BP21-038 / 041 "{[fanfare]} Discard an Academic card: Draw a card." (CR 10.4.7.4: may be paid as it resolves.) */
export const discardAcademicToDraw = fanfare({
  cost: discardA(academic),
  *resolve(fx) {
    yield* fx.draw(1);
  },
});

/**
 * BP21-045 / 046 "Activate {[engage]} this, Earth Rite (2): Deal 1 damage to each enemy follower on the field."
 * (Earth Rite in the cost: offered only when 2 Stack counters can be removed, CR 13.3.3.)
 */
export const gruinneRite = activated(
  { engageSelf: true },
  {
    earthRite: { mode: "required", count: 2 },
    *resolve(fx) {
      yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
    },
  },
);
