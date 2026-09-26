// BP15-024 Arsène Lupin — Swordcraft follower, 2, 2/1. 兵士・盗賊.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Each opponent buries the top card of their deck. If a follower was buried this way, put a Gilded
// Blade token into your EX area. If a spell or amulet was buried this way, put a Gilded Goblet token into your EX
// area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isAmulet, isFollower, isSpell } from "../targets";
import { GILDED_BLADE, GILDED_GOBLET } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const buried = yield* fx.mill(1, g.opponent(fx.controller));
        if (buried.some((id) => isFollower(g, id))) yield* fx.tokensToEx([GILDED_BLADE]);
        if (buried.some((id) => isSpell(g, id) || isAmulet(g, id))) yield* fx.tokensToEx([GILDED_GOBLET]);
      },
    }),
  ],
});
