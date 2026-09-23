// BP01-051 Arch Summoner Erasmus — Runecraft follower, 7, 6/8.
// {[fanfare]} Earth Rite: Select an enemy follower on the field. Deal 6 damage to it and 2
// damage to its leader.
// {[act]}{[engage]}, Earth Rite: Select an enemy follower on the field. Deal 6 damage to it and
// 2 damage to its leader.
// Earth Rite (CR 13.3.3.2) is the whole effect's condition; without an enemy follower it cannot
// be paid, and the leader damage needs the follower (rulings).
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import type { EffectContext } from "../../engine/effects/context";

function* blast(fx: EffectContext) {
  const t = fx.targets[0]![0]!;
  yield* fx.dealDamages([
    { target: t, amount: 6 },
    { target: fx.game.leader(fx.game.controller(t)), amount: 2 },
  ]);
}

export default defineCard({
  abilities: [
    fanfare({ earthRite: { mode: "required" }, targets: [enemyFollower()], resolve: blast }),
    activated({ engageSelf: true }, { earthRite: { mode: "required" }, targets: [enemyFollower()], resolve: blast }),
  ],
});
