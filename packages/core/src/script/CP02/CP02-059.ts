// CP02-059 Arisu Tachibana — Dragoncraft follower, 1, 1/1. デレマス・クール.
// {[fanfare]} If there are at least 3 iM@S CG followers on your field, search your deck for a 1-cost spell or 1-cost amulet,
// reveal it, add it to your hand, then shuffle your deck. (元のコスト; this follower counts.)
import { defineCard, fanfare } from "../helpers";
import { isAmulet, isSpell } from "../targets";
import { followersOnYourField, imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, c) => followersOnYourField(g, c, imas) >= 3,
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => (isSpell(g, id) || isAmulet(g, id)) && g.info(id).cost === 1);
      },
    }),
  ],
});
