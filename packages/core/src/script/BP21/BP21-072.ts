// BP21-072 Dragon Hunt — Dragoncraft spell, 3. 竜族・キラー.
// Select an enemy follower on the field and destroy it. If it costs 4 or more, draw a card. (元のコスト, read before it is
// destroyed; an evolved follower has its base card's cost, CR 5.16.1.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const cost = fx.game.info(target).cost ?? 0;
        yield* fx.destroy([target]);
        if (cost >= 4) yield* fx.draw(1);
      },
    }),
  ],
});
