// BP11-116 Spice Shower — Neutral spell, 2. コック.
// {[quick]}
// Deal 1 damage to each enemy leader. Give your leader {[defense]}+1. Draw a card.
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
