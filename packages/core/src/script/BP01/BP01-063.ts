// BP01-063 Golem Protection — Runecraft spell, 4.
// Summon 2 Guardform Golem tokens. Earth Rite: Give each Golem follower on your field +1/+1.
// (Earth Rite is paid while playing, so an emptied Stack amulet frees its slot first; with a
// full field only as many Golems as fit — rulings.)
import { defineCard, spell } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      earthRite: { mode: "optional" },
      *resolve(fx) {
        yield* fx.summon(["Guardform Golem", "Guardform Golem"]);
        if (!fx.earthRitePaid) return;
        for (const id of fx.game.followers(fx.controller)) {
          if (and(isFollower, hasTrait("ゴーレム"))(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});
