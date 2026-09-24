// BP05-024 Confront Adversity — Swordcraft spell, 2. 兵士.
// Summon a Shield Guardian and Knight token. If there is an enemy follower that costs at least 6
// play points on the field, give the summoned tokens {[attack]}+3/{[defense]}+3 and recover 2 play
// points. (Printed cost, 元のコスト; no recovery without one — ruling.)
import { defineCard, spell } from "../helpers";
import { costAtLeast } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const summoned = yield* fx.summon(["Shield Guardian", "Knight"]);
        const opponent = fx.game.opponent(fx.controller);
        if (!fx.game.followers(opponent).some((id) => costAtLeast(6)(fx.game, id))) return;
        for (const token of summoned) yield* fx.giveStats(token, 3, 3);
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
