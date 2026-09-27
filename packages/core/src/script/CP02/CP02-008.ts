// CP02-008 Shinobu Kudo — Forestcraft follower, 4, 2/2. デレマス・キュート.
// {[fanfare]} Search your deck for up to two 1-cost iM@S CG followers and/or 1-cost iM@S CG amulets with different names,
// summon them, then shuffle your deck. (元のコスト; two followers or two amulets are fine too — ruling.)
import { defineCard, fanfare } from "../helpers";
import { isAmulet, isFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => (isFollower(g, id) || isAmulet(g, id)) && imas(g, id) && g.info(id).cost === 1, {
          max: 2,
          to: "field",
          distinctNames: true,
        });
      },
    }),
  ],
});
