// BP21-017 Spiritelementalist — Forestcraft follower, 6, 5/3. エルフ族.
// {[fanfare]} Deal 5 damage to each enemy follower on the field
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const enemies = fx.game.followers(fx.game.opponent(fx.controller));
        if (enemies.length > 0) yield* fx.dealDamageEach(enemies, 5);
      },
    }),
  ],
});
