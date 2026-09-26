// BP08-104 Alterplane Arbiter (Evolved) — Neutral follower, 6/6. 大神.
// On Evolve: select exactly 3 cemetery cards with different names; if all printed costs match,
// add all three to hand. With fewer than 3 distinct names it cannot be played (rulings; CR 10.6.2.3.3).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, onEvolve } from "../helpers";

const distinctNames = (ids: readonly CardId[], game: GameReader) =>
  new Set(ids.map((id) => game.info(id).name)).size;

export default defineCard({
  abilities: [
    onEvolve({
      condition: (g, p) => distinctNames(g.cards(p, "cemetery"), g) >= 3,
      *resolve(fx) {
        const chosen: CardId[] = [];
        const used = new Set<string>();
        for (let i = 0; i < 3; i++) {
          const candidates = fx.game.cards(fx.controller, "cemetery").filter((id) => !used.has(fx.game.info(id).name));
          const [pick] = yield* fx.selectCards(candidates, 1, 1);
          if (pick === undefined) return;
          chosen.push(pick);
          used.add(fx.game.info(pick).name);
        }
        const costs = new Set(chosen.map((id) => fx.game.info(id).cost));
        if (costs.size === 1) yield* fx.returnToHand(chosen);
      },
    }),
  ],
});
