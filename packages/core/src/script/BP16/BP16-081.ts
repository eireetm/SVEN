// BP16-081 Balto, Dusk Bounty Hunter — Abysscraft follower, 2, 2/2. 魔界.
// {[fanfare]} Choose up to 3. (1) {[cost01]}: Select an enemy follower on the field and destroy it. (2) {[cost01]}:
// Give this {[attack]}+2/{[defense]}+2 and Ward. (3) {[cost01]}: Give this follower {[attack]}+1/{[defense]}+1. Draw 2
// cards. Discard a card. (Targets are selected while playing it; each option once — rulings. Each option's cost is
// asked as it resolves, CR 10.4.7.5.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modeCount: () => 3,
      modes: [
        {
          id: "destroy",
          label: "(1) (1): Destroy an enemy follower",
          cost: playPointsCost(1),
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "ward",
          label: "(2) (1): +2/+2 and Ward",
          cost: playPointsCost(1),
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone !== "field") return;
            yield* fx.giveStats(fx.self, 2, 2);
            yield* fx.giveKeyword(fx.self, "ward");
          },
        },
        {
          id: "draw",
          label: "(3) (1): +1/+1, draw 2, discard 1",
          cost: playPointsCost(1),
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
            yield* fx.draw(2);
            yield* fx.discard(fx.controller, 1, 1);
          },
        },
      ],
    }),
  ],
});
