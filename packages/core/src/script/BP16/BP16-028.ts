// BP16-028 Luminous Commander (Evolved) — Swordcraft follower, 2/2. 指揮官・ルミナス.
// On Evolve - Summon a Knight token. Put a Steelclad Knight or Shield Guardian token into your EX area.
// {[act]} {[cost00]}: Select an enemy follower on the field. Deal 3 damage to it and its leader. Activate only if
// there are at least 3 Officer token followers on your field with different names, and only once per turn.
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { KNIGHT, SHIELD_GUARDIAN, STEELCLAD } from "./shared";
import { oneOfTokens, threeOfficerNames } from "./shared-sword";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([KNIGHT]);
        yield* oneOfTokens(fx, [STEELCLAD, SHIELD_GUARDIAN], "ex");
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: threeOfficerNames,
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 3);
        },
      },
    ),
  ],
});
