// BP17-021 Mistolina & Bayleon (Evolved) — Swordcraft follower, 4/5. 自然・指揮官・獣・プリンセス.
// On Evolve - Search your deck for up to 2 Natura spells that cost a total of 2 or less, put them into your EX area,
// then shuffle. They cost 0 to play this turn. (元のコスト; with room for one, the player picks it and the other stays
// in the deck — ruling.)
// On Super-Evolve - Give this Storm. Recover 2 play points.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { isSpell } from "../targets";
import { natura } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const found = yield* fx.search((id) => isSpell(fx.game, id) && natura(fx.game, id), { max: 2, totalCostAtMost: 2, to: "ex" });
        for (const id of found) yield* fx.setPlayCost(id, 0, "endOfTurn");
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
