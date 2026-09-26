// BP17-T05 Elements of Creation — Runecraft spell token, 5. 魔法使い.
// Spellchain (10) - Deal 7 damage to each enemy leader. Give your leader {[defense]}+7. (CR 13.3.1.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        if (!fx.game.spellchain(fx.controller, 10)) return;
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 7);
        yield* fx.giveLeaderDefense(fx.controller, 7);
      },
    }),
  ],
});
