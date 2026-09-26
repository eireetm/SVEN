// BP08-054 Azi Dahaka (Evolved) — Dragoncraft follower, 7/8. 竜族.
// Storm.
// Strike — with at least 5 faceup evolved followers in your evolve deck, leader +3; with at least
// 8, also deal 3 damage to each enemy leader. Both thresholds apply at 8 (ruling, CR 4.6.3,
// 12.7.1).
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, strike } from "../helpers";
import { isFollower } from "../targets";

const faceupEvolvedFollowers = (fx: EffectContext) =>
  fx.game.faceUpEvolveDeck(fx.controller).filter((id) => isFollower(fx.game, id)).length;

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      *resolve(fx) {
        const n = faceupEvolvedFollowers(fx);
        if (n >= 5) yield* fx.giveLeaderDefense(fx.controller, 3);
        if (n >= 8) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
