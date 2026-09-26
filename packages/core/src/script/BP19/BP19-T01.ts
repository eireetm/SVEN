// BP19-T01 Dread Pirate's Flag — Swordcraft spell token, 1. 八獄・盗賊・財宝.
// Select a Thief follower on your field and give it {[attack]}+1. If it has both the Condemned and Thief traits, deal 1 damage
// to each enemy leader.
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";
import { condemned, thief } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: thief })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 1, 0);
        if (fx.game.card(target)?.zone === "field" && condemned(fx.game, target) && thief(fx.game, target)) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        }
      },
    }),
  ],
});
