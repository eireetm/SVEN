// BP16-018 Fragrantwood Whispers — Forestcraft spell, 1. エルフ族・狩人.
// Choose 1. If a follower on your field evolved this turn, choose up to 2 instead. (1) Give your leader
// {[defense]}+2. (2) Draw a card. (A super-evolution counts; each option once — rulings.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, p) => (g.followerEvolvedThisTurn(p) ? 2 : 1),
      modes: [
        {
          id: "leader",
          label: "(1) Leader +2",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
        {
          id: "draw",
          label: "(2) Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
