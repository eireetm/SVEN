// BP13-059 Roy, Dragonreaver — Dragoncraft follower, 3, 3/3. 武闘竜人・キラー.
// While there's an amulet on your field, this follower has Rush. (A passive — ruling.)
// {[fanfare]} If there are at least 3 Draconic Duelist cards on your field, increase your max play points
// by 1. (This card counts.)
import { defineCard, fanfare } from "../helpers";
import { countIn, draconicDuelist } from "./shared";

export default defineCard({
  // Part of computing keywords: the card types come from typeAndTraits (info would recurse).
  selfKeywords: (g, self) => (g.cards(g.controller(self), "field").some((id) => g.typeAndTraits(id).type === "amulet") ? ["rush"] : []),
  abilities: [
    fanfare({
      condition: (g, p) => countIn(g, p, "field", draconicDuelist) >= 3,
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
  ],
});
