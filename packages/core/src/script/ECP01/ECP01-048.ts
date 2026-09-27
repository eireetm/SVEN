// ECP01-048 Mejiro Ramonu — Havencraft follower, 5, 5/5. ウマ娘・メジロ家.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Choose up to X, where X equals the number of Mejiro Family cards on your field. (1) Select an enemy follower on the
// field and banish it. (2) Give this follower Storm. (3) Give your leader {[defense]}+2. Draw a card. (At most the 3 options, each
// once; without an enemy follower (1) can't be chosen; (1)'s follower is selected before (3) draws — rulings.)
import { defineCard, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { mejiroOnYourField } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      modeCount: (g, c) => mejiroOnYourField(g, c),
      modes: [
        {
          id: "banish",
          label: "Banish an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.banish(fx.targets[0]!);
          },
        },
        {
          id: "storm",
          label: "Give this follower Storm",
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
          },
        },
        {
          id: "leader",
          label: "Give your leader +2 defense and draw a card",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 2);
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
