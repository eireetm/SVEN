// BP04-074 Aqua Nereid — Dragoncraft follower, 2, 0/1. 海洋.
// Ward.
// {[fanfare]} Summon a Megalorca token. If Overflow is active for you, give it Storm.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const [orca] = yield* fx.summon(["Megalorca"]);
        if (orca && fx.game.overflow(fx.controller)) yield* fx.giveKeyword(orca, "storm");
      },
    }),
  ],
});
