// BP06-112 Fall from Grace — Neutral spell, 3. 堕天使.
// Quick.
// Select a follower on the field. Banish it and give its leader {[defense]}+2. Its controller draws
// a card. (Either side — ruling.)
import { defineCard, spell } from "../helpers";
import { anyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [anyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const player = fx.game.controller(target);
        yield* fx.banish([target]);
        yield* fx.giveLeaderDefense(player, 2);
        yield* fx.draw(1, player);
      },
    }),
  ],
});
