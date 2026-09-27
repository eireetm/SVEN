// CP04-T08 Eisdrache — Dragoncraft equipment token, 2. プリコネ・美食殿.
// When a follower equips this, select an enemy follower on the field. {[engage]} it and give the equipped follower
// {[attack]}+2/{[defense]}+2. (CR 14.5.2.2.2. Without an enemy follower it isn't played, so no +2/+2; the stats stay if the
// follower later loses its abilities — rulings.)
// (Place this beneath the equipped follower.)
import { defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    {
      kind: "automatic",
      timing: "other",
      trigger: (e, me) => !me.lookBack && e.type === "equipped" && e.token === me.card,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage([fx.targets[0]![0]!]);
        const follower = fx.game.equippedFollower(fx.self);
        if (follower !== null) yield* fx.giveStats(follower, 2, 2);
      },
    },
  ],
});
