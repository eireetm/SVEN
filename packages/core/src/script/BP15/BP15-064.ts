// BP15-064 Ardent Torch — Dragoncraft spell, 1. 絶傑・竜族.
// Select a follower on your field. Deal 1 damage to it and each enemy leader, and draw a card. (Not playable
// without a follower on your field — ruling.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.targets[0]![0]!, fx.game.leader(fx.game.opponent(fx.controller))], 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
