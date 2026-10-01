// BP22-072 サラマンダーブレス — Dragoncraft spell, 2. 竜族.
// これをプレイする際、コストを+2してよい。
// 相手の場のフォロワー1体を選ぶ。それに4ダメージ。コストを+2したなら、相手の場のフォロワーすべてに1ダメージ。
// (You may play this for 2 more play points (CR 10.4.7.3). Select an enemy follower on the field and deal it 4 damage; if you played
// it for 2 more, deal 1 damage to each enemy follower on the field. Not playable without a follower to select — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playOptions: [{ id: "plus2", label: "Play for 2 more play points", canPay: () => true, *pay() {}, costDelta: 2 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        if (fx.playOption === "plus2") yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
      },
    }),
  ],
});
