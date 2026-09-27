// CP04-062 Until We Meet Again — Dragoncraft spell, 3. プリコネ.
// Choose 1. (1) Increase your max play points by 1. Give your leader {[defense]}+1. (2) If you have 10 max play points, search your
// deck for a 2-cost PriConne follower, summon it, then shuffle. ((2) can be chosen below 10, and then does nothing — ruling. 元のコスト.)
import { defineCard, spell } from "../helpers";
import { costs, priconneFollower, tenMaxPlayPoints } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "1",
          label: "Max play points +1, leader +1 defense",
          *resolve(fx) {
            yield* fx.increaseMaxPlayPoints(1);
            yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        },
        {
          id: "2",
          label: "With 10 max play points: summon a 2-cost PriConne follower from your deck",
          *resolve(fx) {
            if (!tenMaxPlayPoints(fx.game, fx.controller)) return;
            yield* fx.search((id) => priconneFollower(fx.game, id) && costs(2)(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
