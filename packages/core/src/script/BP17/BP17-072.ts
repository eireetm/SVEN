// BP17-072 Touching Thoughts — Dragoncraft spell, 2. 自然・獣.
// When this is discarded, you may put it into your EX area. (Also at the hand limit — ruling.)
// ----------
// Summon a Naterran Great Tree token. If Overflow is active for you, give your leader {[defense]}+1 and recover 1 play point.
import { defineCard, spell } from "../helpers";
import { discardedToEx } from "../BP12/shared";
import { TREE } from "./shared";

export default defineCard({
  abilities: [
    discardedToEx,
    spell({
      *resolve(fx) {
        yield* fx.summon([TREE]);
        if (!fx.game.overflow(fx.controller)) return;
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
