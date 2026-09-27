// CSD03b-002 Dragonic Overlord (Evolved) — 5/5.
// Twin Drive.
// While Overflow is active for you, and there's another Kagero follower on your field, this follower has Storm.
// On Evolve - Select an enemy follower on the field. Deal it 5 damage and, if Overflow is active for you, for the rest of this turn,
// this follower has "Once per turn, when this follower deals combat damage, refresh it." (Not played without a follower to
// select, so no given ability either — ruling. The given ability is engine/abilities/grants.ts `combatDamageRefreshOnce`.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { overlordStorm } from "./shared";

export default defineCard({
  keywords: ["twinDrive"],
  selfKeywords: overlordStorm,
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        if (fx.game.overflow(fx.controller) && fx.game.card(fx.self)?.zone === "field") {
          yield* fx.grant(fx.self, "combatDamageRefreshOnce", "endOfTurn");
        }
      },
    }),
  ],
});
