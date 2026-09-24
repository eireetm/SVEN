// BP03-071 Lance Lizard — Dragoncraft follower, 3, 3/4. 竜族・武装.
// English omits the Fanfare keyword. Japanese (ファンファーレ) and Chinese (《入场曲》) both make
// the Overflow summon a fanfare, so this is a fanfare.
// Once on each of your turns, when this follower is selected for an ability: +1 attack if it is
// still on the field, and 1 damage to the enemy leader (ruling: the +1 does not follow it to EX).
import { defineCard, fanfare, whenThisIsSelected } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.summon(["Draconic Weapon"]);
      },
    }),
    whenThisIsSelected({
      oncePerTurn: true,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
      },
    }),
  ],
});
