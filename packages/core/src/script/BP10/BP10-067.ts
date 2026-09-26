// BP10-067 Dragon Impact — Dragoncraft spell, 6. 竜族.
// Put the top card of your deck into your EX area. Deal 4 damage to each enemy follower on the field.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.topToEx(1);
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 4);
      },
    }),
  ],
});
