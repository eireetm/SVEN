// BP21-024 Agile Twinblader (Evolved) — 3/3.
// Strike - {[cost02]}: If there's another Academic follower on your field, refresh this. Activate only once per turn.
// (CR 10.4.7.4, 10.7.2.2.)
import { playPointsCost } from "../costs";
import { defineCard, strike } from "../helpers";
import { academicFollower } from "./shared";

export default defineCard({
  abilities: [
    {
      ...strike({
        cost: playPointsCost(2),
        *resolve(fx) {
          const g = fx.game;
          if (g.card(fx.self)?.zone !== "field") return;
          if (g.cards(fx.controller, "field").some((id) => id !== fx.self && academicFollower(g, id))) yield* fx.refresh([fx.self]);
        },
      }),
      timesPerTurn: 1,
    },
  ],
});
