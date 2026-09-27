// CP04-071 Dragon's End Fist — Dragoncraft spell, 2. プリコネ・ドラゴンズネスト.
// Select an enemy follower on the field and deal it 4 damage. If there's a Dragon's Nest follower on your field, deal 6 damage
// instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { dragonsNest, followerThat } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const nest = fx.game.followers(fx.controller).some((id) => followerThat(dragonsNest)(fx.game, id));
        yield* fx.dealDamage(fx.targets[0]![0]!, nest ? 6 : 4);
      },
    }),
  ],
});
