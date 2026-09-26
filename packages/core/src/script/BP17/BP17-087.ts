// BP17-087 Vampiric Bloodbinder — Abysscraft follower, 2, 2/2. 吸血鬼.
// {[fanfare]} Deal 1 damage to your leader. Draw a card
// {[lastwords]} Put a Forest Bat token in your EX area.
import { defineCard, fanfare, lastWords } from "../helpers";
import { FOREST_BAT } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        yield* fx.draw(1);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([FOREST_BAT]);
      },
    }),
  ],
});
