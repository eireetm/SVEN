// BP13-033 Mena, Levin Duelist — Swordcraft follower, 2, 3/2. 兵士・レヴィオン.
// Rush.
// While there are at least 5 Levin cards in your cemetery, this follower has Assail and "Strike: Give this
// follower {[attack]}+2/{[defense]}+1." (A passive — ruling: the Strike exists, and so triggers, only
// while the condition holds, like BP09-049.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, strike } from "../helpers";

/** Read with typeAndTraits: it is part of computing this card's keywords (info would recurse). */
const fiveLevin = (g: GameReader, p: PlayerId): boolean =>
  g.cards(p, "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("レヴィオン")).length >= 5;

const menaStrike = strike({
  *resolve(fx) {
    if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 1);
  },
});

export default defineCard({
  keywords: ["rush"],
  selfKeywords: (g, self) => (fiveLevin(g, g.controller(self)) ? ["assail"] : []),
  abilities: [{ ...menaStrike, trigger: (e, me, g) => fiveLevin(g, me.controller) && menaStrike.trigger(e, me, g) }],
});
