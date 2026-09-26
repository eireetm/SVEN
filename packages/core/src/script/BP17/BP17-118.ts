// BP17-118 Unnamed Determination — Neutral spell, 1. 超克.
// Search your deck for a follower with "Maisha" in its name, put it into your EX area, then shuffle. If there are at least
// 5 followers in your cemetery, it costs 1 less to play this turn.
import { defineCard, spell } from "../helpers";
import { isFollower, nameIncludes } from "../targets";
import { followersInCemetery } from "./shared-neutral";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const found = yield* fx.search((id) => isFollower(g, id) && nameIncludes("Maisha")(g, id), { to: "ex" });
        if (followersInCemetery(g, fx.controller) < 5) return;
        for (const id of found) if (g.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -1, "endOfTurn");
      },
    }),
  ],
});
