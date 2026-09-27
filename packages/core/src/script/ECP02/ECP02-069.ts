// ECP02-069 Haru Yuuki [Secret Blue Rose] — Havencraft follower, 1, 2/1. デレマス・クール.
// While there are at least 3 Cool followers or a follower with "Risa Matoba" in its name on your field, this has Rush and Assail. (A
// passive ability; this follower counts — ruling.)
// {[fanfare]} If there's a follower on your field with "Risa Matoba" in its name, put a Magical Item token into your EX area.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";
import { magicalItems } from "./shared";

// typeAndTraits and namesOf (not info): also read inside the keyword passive.
const followersOf = (g: GameReader, p: PlayerId): CardId[] => g.cards(p, "field").filter((id) => g.typeAndTraits(id).type === "follower");
const risa = (g: GameReader, p: PlayerId) => followersOf(g, p).some((id) => g.namesOf(id).some((n) => n.includes("Risa Matoba")));

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const p = g.controller(self);
      const cool = followersOf(g, p).filter((id) => g.typeAndTraits(id).traits.includes("クール")).length;
      return cool >= 3 || risa(g, p) ? ["rush", "assail"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        if (risa(fx.game, fx.controller)) yield* magicalItems(fx);
      },
    }),
  ],
});
