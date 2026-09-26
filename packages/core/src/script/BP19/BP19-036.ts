// BP19-036 Ninja Onslaught — Swordcraft spell, 2. 忍者.
// Select an enemy follower on the field. Deal it 2 damage and draw a card. If there's a Ninja follower on your field, deal 3
// damage instead. (The damage, then the draw — ruling; not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { ninja } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const ninjas = fx.game.followers(fx.controller).some((id) => ninja(fx.game, id));
        yield* fx.dealDamage(fx.targets[0]![0]!, ninjas ? 3 : 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
