// BP10-036 Pompous Summons — Swordcraft spell, 1. 指揮官・プリンセス.
// Choose one. (1) Draw a card. (2) If there's a Princess follower on your field, search your deck for
// a {[swordcraft]} follower, reveal it, add it to your hand, then shuffle. ((2) can be chosen without
// a Princess and then does nothing — ruling.)
import { defineCard, spell } from "../helpers";
import { and, hasTrait, isClass, isFollower } from "../targets";

const swordcraftFollower = and(isFollower, isClass("Swordcraft"));

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "draw",
          label: "(1) Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
        {
          id: "search",
          label: "(2) With a Princess follower on your field, search for a Swordcraft follower",
          *resolve(fx) {
            if (!fx.game.followers(fx.controller).some((id) => hasTrait("プリンセス")(fx.game, id))) return;
            yield* fx.search((id) => swordcraftFollower(fx.game, id));
          },
        },
      ],
    }),
  ],
});
