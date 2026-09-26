// BP16-074 Goldennote Melody — Dragoncraft spell, 3. 竜使い・ドラゴニュート.
// Choose 1. If a follower on your field evolved this turn, choose up to 2 instead. (1) Give your leader
// {[defense]}+3. (2) Draw 2 cards. (A super-evolution counts; each option once — rulings.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, p) => (g.followerEvolvedThisTurn(p) ? 2 : 1),
      modes: [
        {
          id: "leader",
          label: "(1) Leader +3",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 3);
          },
        },
        {
          id: "draw",
          label: "(2) Draw 2 cards",
          *resolve(fx) {
            yield* fx.draw(2);
          },
        },
      ],
    }),
  ],
});
