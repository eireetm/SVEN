// BP07-T02 Repair Mode — Neutral spell token, 1. 機械.
// {[quick]}
// Give your leader {[defense]}+1.
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
