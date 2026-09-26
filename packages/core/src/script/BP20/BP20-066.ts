// BP20-066 Encounter from the Deep — Dragoncraft spell, 7. 海洋.
// Look at the top 5 cards of your deck. You may reveal a Marine follower from among them and summon it. Put the rest on the
// bottom of your deck in any order. Deal each enemy follower on the field damage equal to the defense of the Marine follower
// summoned by this. (Its defense on the field then; none summoned: no damage.)
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { isFollower } from "../targets";
import { marine } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const [summoned] = yield* lookAtTopCards(fx, 5, { filter: (g, id) => isFollower(g, id) && marine(g, id), to: "field" });
        const x = summoned !== undefined && fx.game.card(summoned)?.zone === "field" ? (fx.game.statsOf(summoned).defense ?? 0) : 0;
        const enemies = fx.game.followers(fx.game.opponent(fx.controller));
        if (x > 0 && enemies.length > 0) yield* fx.dealDamageEach(enemies, x);
      },
    }),
  ],
});
