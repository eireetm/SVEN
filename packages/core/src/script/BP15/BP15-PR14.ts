// BP15-PR14 Wings of Desire — Abysscraft spell token, 1. 絶傑・魔界.
// Select a follower on your field. Give it "Strike - Deal each enemy follower on the field damage equal to the
// number of times your leader has lost defense this turn" and deal 1 damage to your leader. (Counted as the Strike
// resolves, e.g. after another Strike — ruling.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.grant(fx.targets[0]![0]!, "strikeLeaderLossDamage");
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
      },
    }),
  ],
});
