// BP20-081 Hervör — Abysscraft follower, 6, 4/4. 魔界.
// {[fanfare]} Choose one. (1) Deal 4 damage to each enemy follower on the field. (2) Give your leader {[defense]}+4. Draw 2
// cards.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "damage",
          label: "(1) 4 damage to each enemy follower",
          *resolve(fx) {
            const enemies = fx.game.followers(fx.game.opponent(fx.controller));
            if (enemies.length > 0) yield* fx.dealDamageEach(enemies, 4);
          },
        },
        {
          id: "leader",
          label: "(2) Leader +4, draw 2",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 4);
            yield* fx.draw(2);
          },
        },
      ],
    }),
  ],
});
