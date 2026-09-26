// BP21-105 Zlatorog (Evolved) — 5/5.
// Ward.
// On Evolve - You may summon a follower with Ward that costs 5 or less from your hand. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const hand = g.cards(fx.controller, "hand").filter((id) => isFollower(g, id) && g.hasKeyword(id, "ward") && costAtMost(5)(g, id));
        const chosen = yield* fx.selectCards(hand, 0, 1);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
      },
    }),
  ],
});
