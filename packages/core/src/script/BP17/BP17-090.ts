// BP17-090 Midnight Gossip — Abysscraft spell, 3. 機械・自然・魔界.
// Select a follower on your field and an enemy follower on the field. Give the first follower {[attack]}+1/{[defense]}+1,
// then deal the second follower damage equal to the first's attack. (Playable only if both can be selected — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower(), enemyFollower()],
      *resolve(fx) {
        const mine = fx.targets[0]![0]!;
        const enemy = fx.targets[1]![0]!;
        if (fx.game.card(mine)?.zone !== "field") return;
        yield* fx.giveStats(mine, 1, 1);
        const attack = fx.game.info(mine).attack ?? 0;
        if (attack > 0) yield* fx.dealDamage(enemy, attack);
      },
    }),
  ],
});
