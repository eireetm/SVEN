// BP21-019 Lecia & Nano, Twilight Trainees — Swordcraft follower, 3, 2/3. 指揮官・兵士・学院・超克.
// While there's another Academic follower on your field, this has Bane. (A passive — ruling.)
// {[fanfare]} Search your deck for a 1-cost follower, summon it, then shuffle. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { costAtLeast, costAtMost, isFollower } from "../targets";

export default defineCard({
  field: {
    // keywordsFor: typeAndTraits (not info) for the other cards.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const other = g.cards(g.card(self)!.controller, "field").some((id) => {
        if (id === self) return false;
        const k = g.typeAndTraits(id);
        return k.type === "follower" && k.traits.includes("学院");
      });
      return other ? ["bane"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && costAtLeast(1)(g, id) && costAtMost(1)(g, id), { to: "field" });
      },
    }),
  ],
});
