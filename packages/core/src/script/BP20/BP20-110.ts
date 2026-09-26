// BP20-110 Blinding Faith — Havencraft spell, 6. 信仰.
// Deal 4 damage to each enemy follower on the field, give your leader {[defense]}+2 and draw a card.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const enemies = fx.game.followers(fx.game.opponent(fx.controller));
        if (enemies.length > 0) yield* fx.dealDamageEach(enemies, 4);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
