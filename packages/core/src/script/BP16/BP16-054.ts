// BP16-054 Sagelight Teachings — Runecraft spell, 1. 魔法使い・ゴーレム.
// Choose 1. If a follower on your field evolved this turn, choose up to 2 instead. (1) Summon a Magic Sediment
// token. Give your leader {[defense]}+1. (2) Put a Guardian Golem token into your EX area. (A super-evolution
// counts; each option once — rulings.)
import { defineCard, spell } from "../helpers";
import { GUARDIAN_GOLEM, MAGIC_SEDIMENT } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, p) => (g.followerEvolvedThisTurn(p) ? 2 : 1),
      modes: [
        {
          id: "sediment",
          label: "(1) A Magic Sediment, leader +1",
          *resolve(fx) {
            yield* fx.summon([MAGIC_SEDIMENT]);
            yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        },
        {
          id: "golem",
          label: "(2) A Guardian Golem into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx([GUARDIAN_GOLEM]);
          },
        },
      ],
    }),
  ],
});
