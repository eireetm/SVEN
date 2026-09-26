// BP11-101 Benevolent Blight — Havencraft spell, 4. 信仰.
// Deal 2 damage to each enemy follower on the field. Give your leader {[defense]}+2. Draw a card.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
