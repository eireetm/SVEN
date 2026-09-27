// CP02-076 Chiyo Shirayuki — Abysscraft follower, 3, 3/3. デレマス・キュート.
// {[fanfare]} Deal 2 damage to your leader. Draw 2 cards.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
        yield* fx.draw(2);
      },
    }),
  ],
});
